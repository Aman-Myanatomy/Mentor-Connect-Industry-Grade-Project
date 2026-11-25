import express from 'express';
import { createRoom, getMessages, listRooms } from '../controllers';
import { requireRole, verifyAccessToken } from '../middlewares';
import { USER_ROLE } from '../enumerations';
import { asyncHandler } from '../utils';

export const chatRouter = (): express.Router => {
  const router = express.Router();
  router.get('/rooms', verifyAccessToken, asyncHandler(listRooms));
  router.post('/rooms', verifyAccessToken, requireRole(USER_ROLE.STUDENT), asyncHandler(createRoom));
  router.get('/rooms/:roomId/messages', verifyAccessToken, asyncHandler(getMessages));
  return router;
};
