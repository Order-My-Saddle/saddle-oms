const isDebug = process.env.NEXT_PUBLIC_DEBUG_LOG === "true";

const noop = () => {};

export const logger = {
  log: isDebug ? console.log.bind(console) : noop,
  debug: isDebug ? console.debug.bind(console) : noop,
  warn: isDebug ? console.warn.bind(console) : noop,
  error: console.error.bind(console), // errors always show
  info: isDebug ? console.info.bind(console) : noop,
};
