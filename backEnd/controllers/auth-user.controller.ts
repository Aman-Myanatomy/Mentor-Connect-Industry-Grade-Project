import { Request, Response } from 'express';
import { HTTP_RESPONSE_STATUS_CODE_ENUM as CODE } from '../enumerations';
import { IAuthenticatedRequest } from '../interfaces';
import * as Sanitize from '../sanitization';
import * as Services from '../services';
import { sanitizeNValidate } from '../utils';
import * as Validate from '../validation';

export const register = async (req: Request, res: Response): Promise<void> => {
  await sanitizeNValidate(Sanitize.AuthUserSanitization, Validate.AuthUserValidation, 'register', req);
  const { name, email, password } = req.body;   // explicit pick (NOT ...req.body) => mass-assignment safe
  res.status(CODE.CREATED).json({ success: true, data: await Services.registerStudent(name, email, password) });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  await sanitizeNValidate(Sanitize.AuthUserSanitization, Validate.AuthUserValidation, 'login', req);
  res.status(CODE.OK).json({ success: true, data: await Services.login(req.body.email, req.body.password) });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  res.status(CODE.OK).json({ success: true, data: { user: (req as IAuthenticatedRequest).user } });
};
