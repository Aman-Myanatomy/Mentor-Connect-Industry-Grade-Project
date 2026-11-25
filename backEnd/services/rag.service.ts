// RAG in ~70 lines: chunk -> index -> retrieve -> (caller) augment prompt -> generate.
// Retrieval is TF-IDF + cosine similarity so students can READ the maths and need no embedding API.
// Production swap: replace vectorise/search with an embedding model + a vector DB (Atlas Vector Search, pgvector, Qdrant).
import fs from 'node:fs';
import path from 'node:path';
import { RAG_MIN_SCORE } from '../constants';
import { RAG_DOC_TYPE } from '../enumerations';
import { IRagChunk } from '../interfaces';
import { logger } from '../utils';
import { listMentors } from './user.service';

interface IIndexedChunk extends Omit<IRagChunk, 'score'> { tf: Map<string, number>; }

const STOP = new Set('a an the and or of to in on for with is are be i my me we you it that this as at by from how what can do want about'.split(' '));
const tokenize = (t: string): string[] => t.toLowerCase().match(/[a-z0-9+#/]+/g)?.filter((w) => w.length > 1 && !STOP.has(w)) ?? [];
const termFreq = (tokens: string[]): Map<string, number> => {
  const m = new Map<string, number>();
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
};

let chunks: IIndexedChunk[] = [];
let idf = new Map<string, number>();
const KB_DIR = path.join(__dirname, '../ai/knowledge-base');

// CHUNKING: split markdown at headings so each chunk is one self-contained idea.
const loadKnowledgeBase = (): Omit<IIndexedChunk, 'tf'>[] => {
  const out: Omit<IIndexedChunk, 'tf'>[] = [];
  for (const file of fs.readdirSync(KB_DIR).filter((f) => f.endsWith('.md'))) {
    const title = file.replace('.md', '');
    fs.readFileSync(path.join(KB_DIR, file), 'utf8').split(/\n(?=#{1,3} )/).forEach((part, i) => {
      if (part.trim().length > 30) out.push({ id: `kb:${title}#${i}`, type: RAG_DOC_TYPE.KNOWLEDGE_BASE, title, text: part.trim() });
    });
  }
  return out;
};

export const buildIndex = async (): Promise<void> => {
  const mentors = (await listMentors()).map((m) => ({
    id: `mentor:${m.id}`, type: RAG_DOC_TYPE.MENTOR, title: m.name, mentorId: m.id,
    text: `${m.name}. ${m.headline}. ${m.bio} Skills: ${m.skills.join(', ')}`
  }));
  chunks = [...loadKnowledgeBase(), ...mentors].map((c) => ({ ...c, tf: termFreq(tokenize(c.text)) }));
  const df = new Map<string, number>();
  for (const c of chunks) for (const t of c.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  idf = new Map([...df].map(([t, n]) => [t, Math.log(1 + chunks.length / n)]));
  logger.info(`RAG index built: ${chunks.length} chunks`);
};

const weigh = (tf: Map<string, number>): Map<string, number> => new Map([...tf].map(([t, n]) => [t, n * (idf.get(t) ?? 0)]));
const norm = (v: Map<string, number>): number => Math.sqrt([...v.values()].reduce((s, x) => s + x * x, 0)) || 1;

export const search = (query: string, opts: { type?: RAG_DOC_TYPE; k: number }): IRagChunk[] => {
  const q = weigh(termFreq(tokenize(query)));
  const qn = norm(q);
  return chunks
    .filter((c) => !opts.type || c.type === opts.type)
    .map(({ tf, ...c }) => {
      const w = weigh(tf);
      let dot = 0;
      for (const [t, x] of q) dot += x * (w.get(t) ?? 0);
      return { ...c, score: dot / (qn * norm(w)) };
    })
    .filter((c) => c.score >= RAG_MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, opts.k);
};
