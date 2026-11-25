import express from 'express';
import { aiAssistantRouter } from './ai-assistant.route';
import { authUserRouter } from './auth-user.route';
import { chatRouter } from './chat.route';
import { healthRouter } from './health.route';
import { mentorRouter } from './mentor.route';

export const routesMiddleware = (app: express.Application): void => {
  app.use('/health', healthRouter());
  app.use('/api/auth-user', authUserRouter());
  app.use('/api/mentors', mentorRouter());
  app.use('/api/chat', chatRouter());
  app.use('/api/ai-assistant', aiAssistantRouter());
};
