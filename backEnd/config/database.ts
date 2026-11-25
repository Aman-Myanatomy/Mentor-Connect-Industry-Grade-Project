import mongoose from 'mongoose';
import { logger } from '../utils';
import { N_CONF } from './env';

export const databaseConnection = async (): Promise<void> => {
  await mongoose.connect(N_CONF.DATABASE_URL, { serverSelectionTimeoutMS: 5000 });
  logger.info('MongoDB connected');
};
