import crypto from 'node:crypto';

// Single source of truth for everything that comes from the environment (.env). Nothing else reads process.env.
const isProd = process.env.NODE_ENV === 'production';

if (isProd && !process.env.JWT_SECRET) throw new Error('JWT_SECRET is required in production');

export const N_CONF = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3000),
  DATABASE_URL: process.env.DATABASE_URL ?? 'mongodb://127.0.0.1:27017/mentor-connect',
  // Dev fallback: random secret => tokens die on restart. Never used in production (see check above).
  JWT_SECRET: process.env.JWT_SECRET ?? crypto.randomBytes(32).toString('hex'),
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5174',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? '',
  AI_MODEL: process.env.AI_MODEL ?? 'gemini-2.5-flash',
  // Dev/workshop helper: when a mentor is offline, their AI persona answers (marked as AI in the UI). Never in production.
  DEMO_AUTO_REPLY: process.env.DEMO_AUTO_REPLY === 'true' && process.env.NODE_ENV !== 'production',
  SEED_MENTOR_PASSWORD: process.env.SEED_MENTOR_PASSWORD ?? 'Mentor-2026-demo'
};
