import { Request } from 'express';
import { validationResult } from 'express-validator';
import { ISanitizeAndValidate } from '../interfaces';
import { BadRequest } from './custom-errors';
import { logger } from './logger';

// Same contract as code-sandbox: run sanitization chains, then validation chains, then throw BadRequest.
export const sanitizeNValidate = async (
  sanitize: ISanitizeAndValidate,
  validate: ISanitizeAndValidate,
  fn: string,
  req: Request
): Promise<void> => {
  for (const chain of sanitize[fn] ?? []) await chain.run(req);
  for (const chain of validate[fn] ?? []) await chain.run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Validation failed in ${fn}:`, errors.array().map((e) => e.msg));
    throw new BadRequest(errors.array()[0].msg);
  }
};
