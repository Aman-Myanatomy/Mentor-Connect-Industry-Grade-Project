import { NextFunction, Request, Response } from 'express';
import { USER_ROLE } from '../enumerations';
import { IAuthenticatedRequest } from '../interfaces';
import { Forbidden } from '../utils';

export const requireRole = (role: USER_ROLE) => (req: Request, _res: Response, next: NextFunction): void => {
  if ((req as IAuthenticatedRequest).user.role !== role) throw new Forbidden();
  next();
};
