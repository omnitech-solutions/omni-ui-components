import type { ContextLevel, ContextThresholds } from './ContextMeter.types';

export const DEFAULT_CONTEXT_THRESHOLDS: ContextThresholds = { warn: 60, danger: 80 };

/** Tokens in thousands: `3100` → `3.1k`. `digits` 0 gives the window form: `262000` → `262k`. */
export const formatTokens = (tokens: number, digits = 1): string =>
  `${(tokens / 1000).toFixed(digits)}k`;

/** How full the window is, 0 to 100, rounded; undefined when there is no window to measure against. */
export function contextPercent(used: number, window?: number): number | undefined {
  return window ? Math.min(100, Math.round((used / window) * 100)) : undefined;
}

/** `normal` up to `warn`, `warn` above it, `danger` above `danger` (both exclusive). No percent is always `normal`. */
export function contextLevel(
  percent: number | undefined,
  thresholds: ContextThresholds = DEFAULT_CONTEXT_THRESHOLDS,
): ContextLevel {
  if (percent === undefined) return 'normal';
  return percent > thresholds.danger ? 'danger' : percent > thresholds.warn ? 'warn' : 'normal';
}
