const stamp = (): string => new Date().toISOString();
export const logger = {
  info: (...a: unknown[]): void => console.log(stamp(), 'INFO ', ...a),
  warn: (...a: unknown[]): void => console.warn(stamp(), 'WARN ', ...a),
  error: (...a: unknown[]): void => console.error(stamp(), 'ERROR', ...a),
  debug: (...a: unknown[]): void => { if (process.env.NODE_ENV !== 'production') console.debug(stamp(), 'DEBUG', ...a); }
};
