import rateLimit from 'express-rate-limit';
import { RATE_LIMIT } from '../constants';
import { IAuthenticatedRequest } from '../interfaces';

const tooMany = (message: string) => ({ success: false, errors: [{ message }] });

export const generalLimiter = rateLimit({ ...RATE_LIMIT.GENERAL, message: tooMany('Too many requests') });
export const loginLimiter = rateLimit({ ...RATE_LIMIT.LOGIN, message: tooMany('Too many login attempts') });
export const registerLimiter = rateLimit({ ...RATE_LIMIT.REGISTER, message: tooMany('Too many sign-ups') });
// Keyed by user id (route is behind verifyAccessToken): a shared school Wi-Fi IP shouldn't share one budget.
export const aiLimiter = rateLimit({
  ...RATE_LIMIT.AI,
  keyGenerator: (req) => `user:${(req as unknown as IAuthenticatedRequest).user.id}`,
  validate: { keyGeneratorIpFallback: false },
  message: tooMany('AI rate limit reached - slow down')
});
