import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const t0 = Date.now();
  res.on('finish', () => logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - t0}ms`));
  next();
};
