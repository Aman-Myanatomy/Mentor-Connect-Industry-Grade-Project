import { Types } from 'mongoose';
import { MESSAGE_KIND, USER_ROLE } from '../enumerations';
import { IUserPublic } from '../interfaces';
import { ChatMessageModel, ChatRoomModel, IChatRoom } from '../models';
import { NotFound } from '../utils';

export const getOrCreateRoom = async (studentId: string, mentorId: string): Promise<IChatRoom> =>
  ChatRoomModel.findOneAndUpdate({ studentId, mentorId }, { $setOnInsert: { studentId, mentorId } }, { upsert: true, returnDocument: 'after' });

// AUTHORIZATION (IDOR defence): knowing a room id is not enough - you must be one of its two members.
// 404 (not 403) so we don't reveal that the room exists.
export const getRoomForMember = async (roomId: string, userId: string): Promise<IChatRoom> => {
  if (!Types.ObjectId.isValid(roomId)) throw new NotFound('Room not found');
  const room = await ChatRoomModel.findOne({ _id: roomId, $or: [{ studentId: userId }, { mentorId: userId }] });
  if (!room) throw new NotFound('Room not found');
  return room;
};

export const isRoomMember = async (roomId: string, userId: string): Promise<boolean> =>
  !!(await ChatRoomModel.exists({ _id: roomId, $or: [{ studentId: userId }, { mentorId: userId }] }));

export const listRoomIdsForUser = async (userId: string): Promise<string[]> =>
  (await ChatRoomModel.find({ $or: [{ studentId: userId }, { mentorId: userId }] }).select('_id')).map((r) => String(r._id));

export const listRoomsForUser = async (user: IUserPublic) => {
  const field = user.role === USER_ROLE.STUDENT ? 'studentId' : 'mentorId';
  const rooms = await ChatRoomModel.find({ [field]: user.id }).populate<{ studentId: { _id: Types.ObjectId; name: string }; mentorId: { _id: Types.ObjectId; name: string; headline: string } }>('studentId mentorId', 'name headline');

  // Latest message of every room in ONE query (aggregate), instead of one query per room.
  const lasts = await ChatMessageModel.aggregate<{ _id: Types.ObjectId; body: string; kind: string; senderId: Types.ObjectId; createdAt: Date }>([
    { $match: { roomId: { $in: rooms.map((r) => r._id) } } },
    { $sort: { _id: -1 } },
    { $group: { _id: '$roomId', body: { $first: '$body' }, kind: { $first: '$kind' }, senderId: { $first: '$senderId' }, createdAt: { $first: '$createdAt' } } }
  ]);
  const lastByRoom = new Map(lasts.map((l) => [String(l._id), l]));

  return rooms.map((r) => {
    const other = user.role === USER_ROLE.STUDENT ? r.mentorId : r.studentId;
    const last = lastByRoom.get(String(r._id));
    return {
      id: String(r._id),
      otherId: String(other._id),
      otherName: other.name,
      otherHeadline: (other as { headline?: string }).headline ?? '',
      lastMessage: last ? { body: last.body, kind: last.kind, senderId: String(last.senderId), createdAt: last.createdAt.toISOString() } : null
    };
  });
};

const toDto = (m: InstanceType<typeof ChatMessageModel>) => ({
  id: String(m._id), roomId: String(m.roomId), senderId: String(m.senderId),
  senderName: m.senderName, body: m.body, kind: m.kind, isAutoReply: m.isAutoReply, createdAt: m.createdAt.toISOString()
});
export type IChatMessageDto = ReturnType<typeof toDto>;

export const listMessages = async (roomId: string, limit = 100): Promise<IChatMessageDto[]> =>
  (await ChatMessageModel.find({ roomId }).sort({ _id: -1 }).limit(limit)).reverse().map(toDto);

export const saveMessage = async (
  roomId: string, sender: IUserPublic, body: string, opts: { kind?: MESSAGE_KIND; isAutoReply?: boolean } = {}
): Promise<IChatMessageDto> =>
  toDto(await ChatMessageModel.create({
    roomId, senderId: sender.id, senderName: sender.name, senderRole: sender.role, body,
    kind: opts.kind ?? MESSAGE_KIND.TEXT, isAutoReply: opts.isAutoReply ?? false
  }));

export const getRoomMentorId = async (roomId: string): Promise<string | null> => {
  const room = await ChatRoomModel.findById(roomId).select('mentorId');
  return room ? String(room.mentorId) : null;
};

export const recentTranscript = async (roomId: string, limit: number): Promise<{ role: string; body: string }[]> =>
  (await ChatMessageModel.find({ roomId, kind: MESSAGE_KIND.TEXT }).sort({ _id: -1 }).limit(limit)).reverse().map((m) => ({ role: m.senderRole, body: m.body }));

