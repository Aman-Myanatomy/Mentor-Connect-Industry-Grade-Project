import express from 'express';
import { databaseConnection } from './config';
import { seedMentorsIfEmpty } from './seeds/seed-mentors';
import { start } from './server';
import { buildIndex } from './services';
import { logger } from './utils';

const initialize = async (): Promise<void> => {
  await databaseConnection();
  await seedMentorsIfEmpty();
  await buildIndex();                       // RAG index needs mentors in the DB
  start(express());
};

initialize().catch((err) => { logger.error('Startup failed', err); process.exit(1); });
