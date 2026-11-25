// DEMO HELPER (dev / workshop only): when a student writes to a mentor who is NOT online, the mentor's
// "AI persona" answers using the same RAG + structured-output pipeline as the copilot.
// The reply is flagged isAutoReply so the UI labels it honestly. Disabled in production (see N_CONF).
import { Server } from 'socket.io';
import { N_CONF } from '../config';
import { RAG_DOC_TYPE, SOCKET_EVENTS } from '../enumerations';
import * as Services from '../services';
import { logger } from '../utils';

const inFlight = new Set<string>();
const MIN_TYPING_MS = 1400;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Full pipeline (RAG + Gemini). If the model is unavailable (quota, outage), fall back to RAG only: the best
// knowledge-base passage for the student's last message. Keeps workshop demos alive on a free-tier API key.
const generateReply = async (roomId: string): Promise<string> => {
  try {
    return (await Services.suggestReply(roomId)).suggested_reply;
  } catch (e) {
    logger.warn('AI unavailable for demo reply, using knowledge-base fallback:', (e as Error).message);
    const last = (await Services.recentTranscript(roomId, 6)).reverse().find((m) => m.role === 'student')?.body ?? '';
    const [hit] = Services.search(last, { type: RAG_DOC_TYPE.KNOWLEDGE_BASE, k: 1 });
    if (!hit) throw e;
    return `Thanks for your message! I'm away right now, but this may help in the meantime:\n\n${hit.text.replace(/^#+ .*\n?/, '').trim()}`;
  }
};

export const maybeAutoReply = async (io: Server, roomId: string): Promise<void> => {
  if (!N_CONF.DEMO_AUTO_REPLY || inFlight.has(roomId)) return;
  inFlight.add(roomId);
  let mentorId: string | null = null;
  try {
    mentorId = await Services.getRoomMentorId(roomId);
    if (!mentorId) return;
    if ((await io.in(`user:${mentorId}`).fetchSockets()).length > 0) return;   // a real mentor is online: stay out of the way
    const mentor = await Services.findMentorById(mentorId);
    if (!mentor) return;

    const typing = (isTyping: boolean) => io.to(`room:${roomId}`).emit(SOCKET_EVENTS.TYPING, { roomId, userId: mentorId, name: mentor.name, isTyping });
    typing(true);
    const [text] = await Promise.all([generateReply(roomId), sleep(MIN_TYPING_MS)]);
    const saved = await Services.saveMessage(roomId, mentor, text, { isAutoReply: true });
    typing(false);
    io.to(`room:${roomId}`).emit(SOCKET_EVENTS.NEW_MESSAGE, saved);
  } catch (e) {
    // Quota, injection guard, model error... the demo reply is optional, so fail quietly.
    logger.warn('demo auto-reply skipped:', (e as Error).message);
    if (mentorId) io.to(`room:${roomId}`).emit(SOCKET_EVENTS.TYPING, { roomId, userId: mentorId, name: '', isTyping: false });
  } finally {
    inFlight.delete(roomId);
  }
};
