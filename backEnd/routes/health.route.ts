import express from 'express';
import { healthCheck } from '../controllers';

export const healthRouter = (): express.Router => {
  const router = express.Router();
  router.get('/check', healthCheck);
  return router;
};
