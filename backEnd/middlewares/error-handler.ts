import { NextFunction, Request, Response } from 'express';
import { HTTP_RESPONSE_STATUS_CODE_ENUM as CODE } from '../enumerations';
import { AppError, logger } from '../utils';

// Central error handler: known errors -> their status, anything else -> generic 500 (no stack traces to clients).
export const errorHandler = (error: Error & { type?: string }, _req: Request, res: Response, next: NextFunction): void => {
  if (res.headersSent) return next(error);
  if (error instanceof AppError) {
    res.status(error.httpCode).json({ success: false, errors: error.errors });
  } else if (error.type === 'entity.parse.failed' || error.type === 'entity.too.large') {
    res.status(CODE.BAD_REQUEST).json({ success: false, errors: [{ message: 'Bad request body' }] });
  } else {
    logger.error('Unhandled error:', error);
    res.status(CODE.INTERNAL_SERVER_ERROR).json({ success: false, errors: [{ message: 'Something went wrong' }] });
  }
};
