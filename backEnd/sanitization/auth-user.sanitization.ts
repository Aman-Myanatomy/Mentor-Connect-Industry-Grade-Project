import { body } from 'express-validator';
import * as Interfaces from '../interfaces';

export const AuthUserSanitization: Interfaces.ISanitizeAndValidate = {
  register: [body('name').trim(), body('email').trim().normalizeEmail()],
  login: [body('email').trim().normalizeEmail()]
};
