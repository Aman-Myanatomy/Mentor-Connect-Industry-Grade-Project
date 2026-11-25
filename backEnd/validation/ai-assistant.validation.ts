import { body, param } from 'express-validator';
import { GOAL_MAX_LENGTH, GOAL_MIN_LENGTH } from '../constants';
import * as Interfaces from '../interfaces';

export const AiAssistantValidation: Interfaces.ISanitizeAndValidate = {
  matchMentors: [
    body('goal').isString().isLength({ min: GOAL_MIN_LENGTH, max: GOAL_MAX_LENGTH })
      .withMessage(`goal must be ${GOAL_MIN_LENGTH}-${GOAL_MAX_LENGTH} characters`)
  ],
  roomAction: [param('roomId').isMongoId().withMessage('roomId must be a valid id')]
};
