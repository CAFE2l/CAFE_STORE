type LoggerContext = Record<string, unknown>;

const ENABLED =
  process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_ENABLE_LOGS === 'true';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

function write(level: LogLevel, scope: string, message: string, context?: LoggerContext) {
  if (!ENABLED) return;

  const meta = context && Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : '';
  const line = `[${scope}] ${level} : ${message}${meta}`;

  switch (level) {
    case 'DEBUG':
      console.debug(line);
      break;
    case 'INFO':
      console.info(line);
      break;
    case 'WARN':
      console.warn(line);
      break;
    case 'ERROR':
      console.error(line);
      break;
  }
}

function serializeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}

export const logger = {
  debug: (scope: string, message: string, context?: LoggerContext) =>
    write('DEBUG', scope, message, context),
  info: (scope: string, message: string, context?: LoggerContext) =>
    write('INFO', scope, message, context),
  warn: (scope: string, message: string, context?: LoggerContext) =>
    write('WARN', scope, message, context),
  error: (scope: string, message: string, context?: LoggerContext) =>
    write('ERROR', scope, message, context),
  serializeError,
};
