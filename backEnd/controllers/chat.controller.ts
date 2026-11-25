import { Request, Response } from 'express';
import { HTTP_RESPONSE_STATUS_CODE_ENUM as CODE, SOCKET_EVENTS } from '../enumerations';
import { IAuthenticatedRequest } from '../interfaces';
import * as Sanitize from '../sanitization';
import * as Services from '../services';
import { io } from '../sockets';
import { NotFound, sanitizeNValidate } from '../utils';
import * as Validate from '../validation';

export const listRooms = async (req: Request, res: Response): Promise<void> => {
  const { user } = req as IAuthenticatedRequest;
  const rooms = await Services.listRoomsForUser(user);
  // Presence snapshot: is the other person connected right now? (Live changes arrive via the PRESENCE socket event.)
  const withPresence = await Promise.all(rooms.map(async (r) => ({ ...r, otherOnline: (await io.in(`user:${r.otherId}`).fetchSockets()).length > 0 })));
  res.status(CODE.OK).json({ success: true, data: { rooms: withPresence } });
};

export const createRoom = async (req: Request, res: Response): Promise<void> => {
  await sanitizeNValidate(Sanitize.ChatSanitization, Validate.ChatValidation, 'createRoom', req);
  const { user } = req as IAuthenticatedRequest;
  const mentor = await Services.findMentorById(req.body.mentorId);
  if (!mentor) throw new NotFound('Mentor not found');
  const room = await Services.getOrCreateRoom(user.id, mentor.id);
  // Put both users' live sockets into the new room and tell the mentor's UI to refresh.
  io.in(`user:${user.id}`).in(`user:${mentor.id}`).socketsJoin(`room:${room._id}`);
  io.to(`user:${mentor.id}`).emit(SOCKET_EVENTS.ROOMS_CHANGED);
  res.status(CODE.CREATED).json({ success: true, data: { roomId: String(room._id) } });
};

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  await sanitizeNValidate(Sanitize.ChatSanitization, Validate.ChatValidation, 'getMessages', req);
  const room = await Services.getRoomForMember(req.params.roomId, (req as IAuthenticatedRequest).user.id);
  res.status(CODE.OK).json({ success: true, data: { messages: await Services.listMessages(String(room._id)) } });
};
