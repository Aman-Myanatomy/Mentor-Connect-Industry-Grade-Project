import { body, param } from 'express-validator';
import * as Interfaces from '../interfaces';

export const ChatSanitization: Interfaces.ISanitizeAndValidate = {
  createRoom: [body('mentorId').trim()],
  getMessages: [param('roomId').trim()]
};
