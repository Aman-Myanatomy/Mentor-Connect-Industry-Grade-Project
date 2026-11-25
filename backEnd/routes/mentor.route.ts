import express from 'express';
import { listMentors } from '../controllers';
import { verifyAccessToken } from '../middlewares';
import { asyncHandler } from '../utils';

export const mentorRouter = (): express.Router => {
  const router = express.Router();
  router.get('/', verifyAccessToken, asyncHandler(listMentors));
  return router;
};
