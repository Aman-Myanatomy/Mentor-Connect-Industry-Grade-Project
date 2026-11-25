import { body, param } from 'express-validator';
import { Types } from 'mongoose';
import { MEET_URL_REGEX, MESSAGE_MAX_LENGTH } from '../constants';
import { MESSAGE_KIND } from '../enumerations';
import * as Interfaces from '../interfaces';

export const ChatValidation: Interfaces.ISanitizeAndValidate = {
  createRoom: [body('mentorId').isMongoId().withMessage('mentorId must be a valid id')],
  getMessages: [param('roomId').isMongoId().withMessage('roomId must be a valid id')]
};

// Socket payloads don't go through express-validator, so we validate by hand (same rules).
export const parseSocketMessage = (payload: unknown): { roomId: string; body: string; kind: MESSAGE_KIND } | null => {
  if (typeof payload !== 'object' || payload === null) return null;
  const { roomId, body: text, kind: rawKind } = payload as Record<string, unknown>;
  const kind = rawKind === undefined ? MESSAGE_KIND.TEXT : rawKind;
  if (kind !== MESSAGE_KIND.TEXT && kind !== MESSAGE_KIND.MEET) return null;
  if (typeof roomId !== 'string' || !Types.ObjectId.isValid(roomId)) return null;
  if (typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > MESSAGE_MAX_LENGTH) return null;
  if (kind === MESSAGE_KIND.MEET && !MEET_URL_REGEX.test(trimmed)) return null;   // only real Google Meet links
  return { roomId, body: trimmed, kind };   // note: we do NOT html-escape here; the UI renders text safely (React escapes)
};
