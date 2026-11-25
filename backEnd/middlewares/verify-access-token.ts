import { NextFunction, Request, Response } from 'express';
import * as Services from '../services';
import { NotAuthorized, asyncHandler } from '../utils';
import { IAuthenticatedRequest } from '../interfaces';

// Authorization: Bearer <jwt>. Role is re-read from the DB on every request (token can't escalate privileges).
export const verifyAccessToken = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw new NotAuthorized('Access token is missing.');
  (req as IAuthenticatedRequest).user = await Services.authenticateToken(token);
  next();
});
