import express from 'express';
import { getMe, login, register } from '../controllers';
import { loginLimiter, registerLimiter, verifyAccessToken } from '../middlewares';
import { asyncHandler } from '../utils';

export const authUserRouter = (): express.Router => {
  const router = express.Router();
  router.post('/register', registerLimiter, asyncHandler(register));
  router.post('/login', loginLimiter, asyncHandler(login));
  router.get('/me', verifyAccessToken, asyncHandler(getMe));
  return router;
};
