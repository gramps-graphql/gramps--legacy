/* eslint-disable no-console */
const defaultLogger = {
  error: (msg?: any) => console.error(msg),
  info: (msg?: any) => console.info(msg),
  warn: (msg?: any) => console.warn(msg)
};

export default defaultLogger;
