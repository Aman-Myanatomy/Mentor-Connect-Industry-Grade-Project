// AI-INPUT HYGIENE: everything that must happen to text BEFORE it goes into a prompt.

// Layer 1 of prompt-injection defence (heuristic). Layers 2-4: system rules, delimiters, output verification.
const INJECTION_PATTERNS: RegExp[] = [
  /ignore (all |any |the )?(previous|prior|above|earlier) (instructions|rules|prompts?)/i,
  /disregard (the |your )?(system|previous|above)/i,
  /(reveal|show|print|repeat) (me )?(your|the) (system )?(prompt|instructions|api[ _-]?key)/i,
  /you are now (a|an|in)\b/i,
  /\bdeveloper mode\b|\bjailbreak\b|\bDAN\b/i,
  /<\/?(system|assistant|documents?|user_goal|transcript)>/i   // attempts to break out of our delimiters
];

export const looksLikePromptInjection = (text: string): boolean => INJECTION_PATTERNS.some((re) => re.test(text));

// Remove PII before text leaves our server for a third-party model.
export const redactPII = (text: string): string => text
  .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]')
  .replace(/\+?\d[\d\s().-]{8,}\d/g, '[phone]');

// Make it impossible for user text to forge our own <tags>.
export const neutralizeTags = (text: string): string => text.replace(/</g, '‹').replace(/>/g, '›');
