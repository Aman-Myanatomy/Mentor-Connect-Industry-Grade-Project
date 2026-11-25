import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import http from 'node:http';
import { JSON_BODY_LIMIT } from './constants';
import { N_CONF, corsOptions } from './config';
import { errorHandler, generalLimiter, requestLogger } from './middlewares';
import { routesMiddleware } from './routes';
import { setupWebSockets } from './sockets';
import { logger } from './utils';

const start = (app: express.Application): http.Server => {
  securityMiddleware(app);
  routesMiddleware(app);
  app.use(errorHandler);
  return startServer(app);
};

const securityMiddleware = (app: express.Application): void => {
  app.disable('x-powered-by');
  app.set('trust proxy', 1);                         // behind one proxy hop (nginx/ingress) => real client IP for rate limits
  app.use(helmet());                                 // security headers (nosniff, frame-ancestors, HSTS...)
  app.use(cors(corsOptions));                        // config/cors.ts: one allow-listed origin, never '*' with auth
  app.use(express.json({ limit: JSON_BODY_LIMIT }));
  app.use(requestLogger);
  app.use('/api', generalLimiter);
};

const startServer = (app: express.Application): http.Server => {
  const httpServer = new http.Server(app);
  setupWebSockets(httpServer);
  httpServer.listen(N_CONF.PORT, () => logger.info(`MentorConnect API on http://localhost:${N_CONF.PORT}`));
  return httpServer;
};

export { start };
