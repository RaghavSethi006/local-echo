const DEBUG = typeof window !== 'undefined' && (
  localStorage.getItem('local-echo-debug') !== null ||
  new URLSearchParams(window.location.search).has('debug')
);

export const logger = {
  log: (...args: unknown[]) => {
    if (DEBUG) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (DEBUG) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};
