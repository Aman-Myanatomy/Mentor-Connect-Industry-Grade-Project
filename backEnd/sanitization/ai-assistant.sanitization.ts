import { body, param } from 'express-validator';
import * as Interfaces from '../interfaces';

export const AiAssistantSanitization: Interfaces.ISanitizeAndValidate = {
  matchMentors: [body('goal').trim()],
  roomAction: [param('roomId').trim()]
};
