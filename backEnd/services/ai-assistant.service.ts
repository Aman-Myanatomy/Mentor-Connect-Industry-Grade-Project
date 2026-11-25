// ORCHESTRATION: a deterministic pipeline where CODE owns the control flow and the LLM does one small,
// schema-bound job per step. Every step is timed and traced so students can SEE it in the UI.
//
//   guard (code) -> extract intent (LLM) -> retrieve (RAG) -> rank (LLM) -> verify (code)
import { RAG_KB_TOP_K, RAG_MENTOR_TOP_K, AI_SUMMARY_MESSAGES, AI_TRANSCRIPT_MESSAGES } from '../constants';
import { RAG_DOC_TYPE, REPLY_TONE, STUDENT_LEVEL } from '../enumerations';
import { ITraceStep } from '../interfaces';
import { SYSTEM_PROMPTS } from '../ai/prompts';
import { IntentSchema, RankSchema, SuggestSchema, SummarySchema } from '../ai/schemas';
import { looksLikePromptInjection, neutralizeTags, redactPII } from '../sanitization';
import { BadRequest } from '../utils';
import { recentTranscript } from './chat.service';
import { structured } from './llm.service';
import { search } from './rag.service';
import { findMentorById } from './user.service';

const step = async <T>(trace: ITraceStep[], name: string, fn: () => Promise<{ value: T; detail: unknown }> | { value: T; detail: unknown }): Promise<T> => {
  const t0 = performance.now();
  const out = await fn();
  trace.push({ step: name, ms: Math.round(performance.now() - t0), detail: out.detail });
  return out.value;
};

// Untrusted text goes inside tags; neutralizeTags stops it from forging a closing tag.
const fence = (tag: string, text: string): string => `<${tag}>\n${neutralizeTags(text)}\n</${tag}>`;

// ============ Pipeline 1: mentor matching ============
export const matchMentors = async (rawGoal: string) => {
  const trace: ITraceStep[] = [];

  const goal = await step(trace, '1. guard (code)', () => {
    if (looksLikePromptInjection(rawGoal)) throw new BadRequest('Your message looks like an attempt to change the AI instructions. Please describe your learning goal.');
    const clean = redactPII(rawGoal);
    return { value: clean, detail: `injection check passed; PII redacted: ${clean !== rawGoal}` };
  });

  const intent = await step(trace, '2. extract intent (LLM -> JSON)', async () => {
    const value = await structured({
      name: 'record_intent', schema: IntentSchema,
      system: SYSTEM_PROMPTS.extractIntent, user: `Extract the intent.\n${fence('user_goal', goal)}`,
      mock: () => {
        const known = ['security', 'node', 'react', 'llm', 'rag', 'docker', 'aws', 'career', 'interviews', 'python', 'css', 'postgres'];
        const g = goal.toLowerCase();
        return { skills: known.filter((k) => g.includes(k)).slice(0, 4), level: /advanced|senior/.test(g) ? STUDENT_LEVEL.ADVANCED : STUDENT_LEVEL.BEGINNER, goal_summary: goal.slice(0, 150) };
      }
    });
    return { value, detail: value };
  });

  const candidates = await step(trace, '3. retrieve mentors (RAG)', () => {
    const value = search(`${intent.skills.join(' ')} ${intent.goal_summary}`, { type: RAG_DOC_TYPE.MENTOR, k: RAG_MENTOR_TOP_K });
    return { value, detail: value.map((c) => `${c.title} (${c.score.toFixed(2)})`) };
  });
  if (!candidates.length) return { intent, matches: [], trace };

  const ranking = await step(trace, '4. rank (LLM -> JSON)', async () => {
    const docs = candidates.map((c) => `[mentor_id=${c.mentorId}] ${c.text}`).join('\n');
    const value = await structured({
      name: 'record_ranking', schema: RankSchema,
      system: SYSTEM_PROMPTS.rankMentors,
      user: `Student level: ${intent.level}. Goal: ${intent.goal_summary}\n${fence('documents', docs)}`,
      mock: () => ({ ranking: candidates.map((c) => ({ mentor_id: c.mentorId!, score: Math.round(c.score * 100), reason: `Profile overlaps with your goal (keyword match ${c.score.toFixed(2)}).` })) })
    });
    return { value: value.ranking, detail: `${value.ranking.length} ranked` };
  });

  const matches = await step(trace, '5. verify output (code)', async () => {
    // Never trust the LLM's IDs: only mentors we actually retrieved may appear (stops hallucinated / injected ids).
    const allowed = new Set(candidates.map((c) => c.mentorId));
    const value = [];
    for (const r of ranking.filter((x) => allowed.has(x.mentor_id))) {
      const mentor = await findMentorById(r.mentor_id);
      if (mentor) value.push({ mentorId: r.mentor_id, score: r.score, reason: r.reason, mentor: { id: mentor.id, name: mentor.name, headline: mentor.headline, skills: mentor.skills } });
    }
    return { value, detail: `${ranking.length - value.length} rejected` };
  });

  return { intent, matches, trace };
};

// ============ Pipeline 2: mentor reply copilot (RAG + structured output) ============
const loadTranscript = async (roomId: string, limit: number): Promise<string> => {
  const rows = await recentTranscript(roomId, limit);
  if (!rows.length) throw new BadRequest('No messages yet');
  const text = rows.map((r) => `${r.role}: ${redactPII(r.body)}`).join('\n');
  // Chat text is untrusted too: a student could try to hijack the mentor's copilot.
  if (looksLikePromptInjection(text)) throw new BadRequest('Conversation contains instruction-like text; AI assist is disabled for it.');
  return text;
};

export const suggestReply = async (roomId: string) => {
  const trace: ITraceStep[] = [];
  const chat = await loadTranscript(roomId, AI_TRANSCRIPT_MESSAGES);
  const lastStudent = chat.split('\n').reverse().find((l) => l.startsWith('student:')) ?? chat;

  const docs = await step(trace, '1. retrieve KB (RAG)', () => {
    const value = search(lastStudent, { type: RAG_DOC_TYPE.KNOWLEDGE_BASE, k: RAG_KB_TOP_K });
    return { value, detail: value.map((d) => `${d.title} (${d.score.toFixed(2)})`) };
  });

  const result = await step(trace, '2. draft reply (LLM -> JSON)', async () => {
    const value = await structured({
      name: 'record_reply', schema: SuggestSchema,
      system: SYSTEM_PROMPTS.suggestReply,
      user: `Draft the mentor's next reply.\n${fence('transcript', chat)}\n${fence('documents', docs.map((d) => `# ${d.title}\n${d.text}`).join('\n\n'))}`,
      mock: () => ({
        suggested_reply: `Thanks for sharing that! ${docs[0] ? docs[0].text.split('\n').slice(1).join(' ').slice(0, 300) : 'Could you tell me a bit more about what you have tried so far?'}`,
        sources: docs.slice(0, 1).map((d) => d.title), tone: REPLY_TONE.ENCOURAGING
      })
    });
    return { value, detail: `tone=${value.tone}` };
  });

  // Verify citations: keep only sources that really came from retrieval.
  const real = new Set(docs.map((d) => d.title));
  return { ...result, sources: result.sources.filter((s) => real.has(s)), trace };
};

export const summarizeRoom = async (roomId: string) => {
  const trace: ITraceStep[] = [];
  const chat = await loadTranscript(roomId, AI_SUMMARY_MESSAGES);
  const result = await step(trace, 'summarize (LLM -> JSON)', async () => {
    const value = await structured({
      name: 'record_summary', schema: SummarySchema,
      system: SYSTEM_PROMPTS.summarize, user: `Summarise this chat.\n${fence('transcript', chat)}`,
      mock: () => ({ summary: `Chat with ${chat.split('\n').length} message(s).`, topics: [], action_items: [] })
    });
    return { value, detail: `${value.action_items.length} action items` };
  });
  return { ...result, trace };
};
