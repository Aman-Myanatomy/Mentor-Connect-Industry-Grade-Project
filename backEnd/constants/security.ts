export const ACCESS_TOKEN_EXPIRY = '2h';
export const BCRYPT_ROUNDS = 12;
export const JSON_BODY_LIMIT = '10kb';           // tiny on purpose: blocks giant-payload DoS
export const SOCKET_MAX_PAYLOAD_BYTES = 10_000;
export const SOCKET_MESSAGES_PER_WINDOW = 10;    // per socket
export const SOCKET_WINDOW_MS = 10_000;
export const MESSAGE_MAX_LENGTH = 2000;
export const GOAL_MIN_LENGTH = 10;
export const GOAL_MAX_LENGTH = 1000;
export const RATE_LIMIT = {
  GENERAL: { windowMs: 60_000, limit: 120 },
  LOGIN: { windowMs: 15 * 60_000, limit: 10 },
  REGISTER: { windowMs: 60 * 60_000, limit: 10 },
  AI: { windowMs: 60_000, limit: 10 }             // every AI call costs money => per-user limit
};

// A Google Meet link is ONLY accepted in this exact shape (https, meet.google.com, code like abc-defg-hij, optional ?authuser=N).
// Anything else (javascript:, other hosts, look-alike domains, extra paths) is rejected on server AND client.
export const MEET_URL_REGEX = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(\?authuser=\d{1,2})?$/;
