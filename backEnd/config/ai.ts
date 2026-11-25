// Third-party AI provider (Google Gemini). With no API key the app runs in MOCK mode (client = null).
import { GoogleGenAI } from '@google/genai';
import { AI_TIMEOUT_MS } from '../constants';
import { logger } from '../utils';
import { N_CONF } from './env';

export const geminiClient: GoogleGenAI | null = N_CONF.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: N_CONF.GEMINI_API_KEY, httpOptions: { apiVersion: 'v1beta', timeout: AI_TIMEOUT_MS } })
  : null;

if (!geminiClient) logger.warn('GEMINI_API_KEY not set - AI features run in MOCK mode (no network)');
