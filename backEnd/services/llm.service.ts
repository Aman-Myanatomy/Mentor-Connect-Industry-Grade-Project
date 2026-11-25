// The ONLY file that talks to the model. Everything else calls structured().
//
// STRUCTURED OUTPUT: we send Gemini a JSON Schema (made from our zod schema) and set
// responseMimeType = application/json, so the model must answer with matching JSON.
// We then validate AGAIN with zod: a schema guarantees SHAPE, not TRUTH - never trust, always verify.
import { z } from 'zod';
import { N_CONF, geminiClient as client } from '../config';
import { AI_MAX_TOKENS, AI_TEMPERATURE } from '../constants';
import { AppError, logger } from '../utils';

export const isMockMode = !client;

interface IStructuredCall<T extends z.ZodType> {
  name: string;       // label for logs
  schema: T;
  system: string;     // SYSTEM instructions: role, hard rules, output contract (ours, never user text)
  user: string;       // USER message: the task + untrusted data fenced in tags
  mock: () => z.input<T> | Promise<z.input<T>>;
}

export const structured = async <T extends z.ZodType>(call: IStructuredCall<T>): Promise<z.output<T>> => {
  const ai = client;                 // local const: TypeScript keeps the null-check narrowing inside the closures below
  if (!ai) return call.schema.parse(await call.mock());

  const { $schema: _ignored, ...jsonSchema } = z.toJSONSchema(call.schema) as Record<string, unknown>;
  let feedback = '';
  const generate = async (contents: string) => {
    try {
      return await ai.models.generateContent({
        model: N_CONF.AI_MODEL,
        contents,
        config: {
          systemInstruction: call.system,
          responseMimeType: 'application/json',
          responseJsonSchema: jsonSchema,
          maxOutputTokens: AI_MAX_TOKENS,
          temperature: AI_TEMPERATURE
        }
      });
    } catch (e) {
      // Provider quota / overload => a clean, retryable error for the UI instead of a generic 500.
      const status = (e as { status?: number }).status;
      if (status === 429 || status === 503) throw new AppError(429, 'The AI service is busy right now. Please try again in a few seconds.');
      throw e;
    }
  };
  for (let attempt = 0; attempt < 2; attempt++) {   // one retry, telling the model what was wrong
    const res = await generate(call.user + feedback);
    let raw: unknown;
    try { raw = JSON.parse(res.text ?? ''); } catch { raw = undefined; }
    const parsed = call.schema.safeParse(raw);
    if (parsed.success) return parsed.data;
    logger.warn(`${call.name}: model output failed validation (attempt ${attempt + 1})`);
    feedback = `\n\nYour previous output failed validation: ${parsed.success ? '' : parsed.error.message}. Fix it.`;
  }
  throw new Error('Model output failed schema validation');
};
