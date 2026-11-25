import bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../constants';
import { N_CONF } from '../config';
import { USER_ROLE } from '../enumerations';
import { UserModel } from '../models';
import { logger } from '../utils';

const MENTORS = [
  { name: 'Priya Nair', email: 'priya@mentors.dev', headline: 'Senior AppSec Engineer', bio: 'Ten years breaking and fixing web apps. Runs threat-modeling sessions and OWASP Top 10 code reviews.', skills: ['security', 'owasp', 'threat modeling', 'node', 'jwt'] },
  { name: 'Marcus Chen', email: 'marcus@mentors.dev', headline: 'Staff Backend Engineer', bio: 'Builds high-traffic APIs and real-time systems. Loves WebSockets, Postgres tuning and clean architecture.', skills: ['node', 'express', 'postgres', 'websockets', 'system design'] },
  { name: 'Aisha Rahman', email: 'aisha@mentors.dev', headline: 'ML Engineer, LLM apps', bio: 'Ships RAG and agent products. Teaches prompt design, structured outputs, evals and guardrails.', skills: ['llm', 'rag', 'prompting', 'python', 'evaluation'] },
  { name: 'Diego Alvarez', email: 'diego@mentors.dev', headline: 'Frontend Lead', bio: 'React and accessibility specialist. Helps juniors with portfolios, design systems and performance.', skills: ['react', 'css', 'accessibility', 'typescript', 'portfolio'] },
  { name: 'Sara Johansson', email: 'sara@mentors.dev', headline: 'Engineering Manager', bio: 'Coaches early-career engineers on interviews, career roadmaps and communication.', skills: ['career', 'interviews', 'communication', 'leadership'] },
  { name: 'Kofi Mensah', email: 'kofi@mentors.dev', headline: 'DevOps / Cloud Engineer', bio: 'Docker, CI/CD, AWS and observability. Walks students through their first production deploy.', skills: ['docker', 'aws', 'ci/cd', 'linux', 'monitoring'] }
];

export const seedMentorsIfEmpty = async (): Promise<void> => {
  if (await UserModel.exists({ role: USER_ROLE.MENTOR })) return;
  const passwordHash = await bcrypt.hash(N_CONF.SEED_MENTOR_PASSWORD, BCRYPT_ROUNDS);
  await UserModel.insertMany(MENTORS.map((m) => ({ ...m, passwordHash, role: USER_ROLE.MENTOR })));
  logger.info(`Seeded ${MENTORS.length} mentors`);
};
