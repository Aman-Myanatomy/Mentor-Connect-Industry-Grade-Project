import { body } from 'express-validator';
import * as Interfaces from '../interfaces';

export const AuthUserValidation: Interfaces.ISanitizeAndValidate = {
  register: [
    body('name').isString().withMessage('name is required').isLength({ min: 2, max: 60 }).withMessage('name must be 2-60 chars'),
    body('email').isEmail().withMessage('A valid email is required').isLength({ max: 120 }),
    body('password').isString().isLength({ min: 10, max: 100 }).withMessage('password must be 10-100 chars')
  ],
  login: [
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').isString().notEmpty().isLength({ max: 100 }).withMessage('password is required')
  ]
};
