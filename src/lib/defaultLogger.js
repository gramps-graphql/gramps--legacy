/* eslint-disable no-console */
const defaultLogger = {
  info: msg => console.info(msg),
  warn: msg => console.warn(msg),
  error: msg => console.error(msg),
};

export default defaultLogger;
