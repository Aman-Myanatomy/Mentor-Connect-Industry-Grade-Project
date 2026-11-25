// Schemas = the contract between the LLM and our code (structured output).
import { z } from 'zod';
import { REPLY_TONE, STUDENT_LEVEL } from '../enumerations';

export const IntentSchema = z.object({
  skills: z.array(z.string()).max(6).describe('technical or soft skills the student wants to learn'),
  level: z.enum(STUDENT_LEVEL),
  goal_summary: z.string().max(200)
});

export const RankSchema = z.object({
  ranking: z.array(z.object({
    mentor_id: z.string().describe('the mentor_id exactly as given in the documents'),
    score: z.number().min(0).max(100),
    reason: z.string().max(300)
  })).max(5)
});

export const SuggestSchema = z.object({
  suggested_reply: z.string().max(900),
  sources: z.array(z.string()).max(4),
  tone: z.enum(REPLY_TONE)
});

export const SummarySchema = z.object({
  summary: z.string().max(600),
  topics: z.array(z.string()).max(6),
  action_items: z.array(z.object({ owner: z.enum(['student', 'mentor']), task: z.string().max(200) })).max(8)
});
