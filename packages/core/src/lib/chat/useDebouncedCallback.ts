import * as React from 'react';

export interface DebouncedCallback<A extends unknown[]> {
  (...args: A): void;
  /** Run the pending call now (if any). */
  flush: () => void;
  /** Drop the pending call. */
  cancel: () => void;
}

/**
 * A debounced version of `callback`: it runs `delay` ms after the last call, always with the latest `callback`.
 * A pending call is flushed when the component unmounts, so the last edit of an autosaved field is never lost.
 */
export const useDebouncedCallback = <A extends unknown[]>(callback: (...args: A) => void, delay: number): DebouncedCallback<A> => {
  const latest = React.useRef(callback);
  latest.current = callback;
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const pending = React.useRef<A | null>(null);

  const flush = React.useCallback(() => {
    clearTimeout(timer.current);
    const args = pending.current;
    pending.current = null;
    if (args) latest.current(...args);
  }, []);
  const cancel = React.useCallback(() => {
    clearTimeout(timer.current);
    pending.current = null;
  }, []);
  React.useEffect(() => flush, [flush]);

  return React.useMemo(() => {
    const debounced = ((...args: A) => {
      pending.current = args;
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, delay);
    }) as DebouncedCallback<A>;
    debounced.flush = flush;
    debounced.cancel = cancel;
    return debounced;
  }, [delay, flush, cancel]);
};
