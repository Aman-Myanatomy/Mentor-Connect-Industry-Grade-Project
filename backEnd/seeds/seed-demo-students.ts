// STANDALONE SCRIPT (dev / workshop only). Nothing imports this file; run it from package.json:
//
//     npm run seed:demo
//
// Creates three ready-made student accounts and one sample conversation (Riya <-> Priya), so students can log in
// without registering and a mentor login immediately has a chat to reply to. Safe to run many times (idempotent).
// Needs the 6 mentors to exist: start the API once first (it seeds them), or the sample conversation is skipped.
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { N_CONF, databaseConnection } from '../config';
import { BCRYPT_ROUNDS } from '../constants';
import { USER_ROLE } from '../enumerations';
import { ChatMessageModel, ChatRoomModel, UserModel } from '../models';
import { logger } from '../utils';

const DEMO_STUDENT_PASSWORD = 'Student-2026-demo';
const STUDENTS = [
  { name: 'Riya Sharma', email: 'riya@students.dev' },
  { name: 'Arjun Mehta', email: 'arjun@students.dev' },
  { name: 'Neha Verma', email: 'neha@students.dev' }
];

const seedDemoStudents = async (): Promise<void> => {
  const passwordHash = await bcrypt.hash(DEMO_STUDENT_PASSWORD, BCRYPT_ROUNDS);
  for (const s of STUDENTS) {
    if (await UserModel.exists({ email: s.email })) { logger.info(`Demo student exists: ${s.email}`); continue; }
    await UserModel.create({ ...s, passwordHash, role: USER_ROLE.STUDENT });
    logger.info(`Seeded demo student ${s.email}`);
  }

  // One sample conversation: Riya <-> Priya (only if they have never talked).
  const riya = await UserModel.findOne({ email: 'riya@students.dev' });
  const priya = await UserModel.findOne({ email: 'priya@mentors.dev' });
  if (!riya || !priya) { logger.warn('Mentor Priya not found: start the API once (it seeds mentors), then run this again for the sample chat.'); return; }
  if (await ChatRoomModel.exists({ studentId: riya._id, mentorId: priya._id })) { logger.info('Sample conversation exists'); return; }

  const room = await ChatRoomModel.create({ studentId: riya._id, mentorId: priya._id });
  const say = (from: typeof riya, body: string) => ({ roomId: room._id, senderId: from._id, senderName: from.name, senderRole: from.role, body });
  await ChatMessageModel.insertMany([
    say(riya, 'Hi Priya! I am a second-year student and I want to learn web security. Where should I start?'),
    say(priya, 'Hi Riya, great goal! Start with the OWASP Top 10 and build a small login system, then try to attack it yourself.'),
    say(riya, 'Should I use JWT or sessions for the login system?')
  ]);
  logger.info('Seeded sample conversation Riya <-> Priya');
};

const run = async (): Promise<void> => {
  if (N_CONF.NODE_ENV === 'production') throw new Error('Refusing to create demo accounts with NODE_ENV=production');
  await databaseConnection();
  await seedDemoStudents();
  logger.info(`Done. Demo students log in with password "${DEMO_STUDENT_PASSWORD}"`);
};

run()
  .then(() => mongoose.disconnect())
  .catch(async (err) => { logger.error('Demo seed failed:', (err as Error).message); await mongoose.disconnect(); process.exit(1); });
