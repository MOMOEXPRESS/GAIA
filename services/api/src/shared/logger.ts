/**
 * Structured JSON logging to stdout (Vol 6 §10.1). Logs never contain PHI;
 * user identifiers are the only user-linked field and are treated as
 * pseudonymous identifiers downstream.
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
}

function write(level: LogLevel, service: string, message: string, meta?: Record<string, unknown>): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service,
    message,
    ...meta,
  };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(entry));
}

export function createLogger(service: string): Logger {
  return {
    debug: (message, meta) => write('debug', service, message, meta),
    info: (message, meta) => write('info', service, message, meta),
    warn: (message, meta) => write('warn', service, message, meta),
    error: (message, meta) => write('error', service, message, meta),
  };
}
