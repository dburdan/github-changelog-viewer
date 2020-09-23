const log = (
  message: string,
  type: 'debug' | 'info' | 'warn' | 'error' = 'info',
  extra?: unknown,
): void => {
  let logMessage = `[GCV] ${message}`;
  let logFunction = console.log;
  if (type === 'error') {
    logFunction = console.error;
    logMessage += ' Not showing changelog helper.'
  } else if (type === 'warn') {
    logFunction = console.warn;
  }
  logFunction(logMessage, extra);
};

export default {
  log,
};
