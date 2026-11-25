import express from 'express';
import { getStatus, matchMentors, suggestReply, summarizeRoom } from '../controllers';
import { USER_ROLE } from '../enumerations';
import { aiLimiter, requireRole, verifyAccessToken } from '../middlewares';
import { asyncHandler } from '../utils';

export const aiAssistantRouter = (): express.Router => {
  const router = express.Router();
  router.use(verifyAccessToken);
  router.get('/status', asyncHandler(getStatus));
  router.post('/match-mentors', aiLimiter, requireRole(USER_ROLE.STUDENT), asyncHandler(matchMentors));
  router.post('/rooms/:roomId/suggest-reply', aiLimiter, requireRole(USER_ROLE.MENTOR), asyncHandler(suggestReply));
  router.post('/rooms/:roomId/summary', aiLimiter, asyncHandler(summarizeRoom));
  return router;
};
