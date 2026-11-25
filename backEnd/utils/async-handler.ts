import express from 'express';

export const asyncHandler = (
  fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<unknown> | void
): express.RequestHandler => (req, res, next) => { Promise.resolve(fn(req, res, next)).catch(next); };
