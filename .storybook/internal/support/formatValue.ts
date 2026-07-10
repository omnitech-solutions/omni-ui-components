import * as React from 'react';

const isShallow = (v: unknown): boolean => v === null || typeof v !== 'object';

const isReactElement = (v: unknown): boolean => Boolean(v && typeof v === 'object' && '$$typeof' in (v as object));

const reactElementLabel = (el: unknown): string => {
  const type = (el as { type?: unknown }).type;
  if (typeof type === 'string') return `<${type} />`;
  if (typeof type === 'function') {
    const displayName = (type as { displayName?: string; name?: string }).displayName || (type as { name?: string }).name || 'Component';
    return `<${displayName} />`;
  }
  return '<Component />';
};

const collapseWhitespace = (source: string): string => source.replace(/\s+/g, ' ').trim();

const stringifyFunction = (fn: (...args: unknown[]) => unknown): string => {
  return collapseWhitespace(fn.toString());
};
export const oneLine = (value: unknown, seen: WeakSet<object> = new WeakSet()): string => {
  if (value === undefined) return 'undefined';
  if (typeof value === 'function') return stringifyFunction(value as (...args: unknown[]) => unknown);
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (isReactElement(value)) return reactElementLabel(value);
  if (seen.has(value as object)) return '[Circular]';
  seen.add(value as object);
  if (Array.isArray(value)) return `[${value.map((v) => oneLine(v, seen)).join(', ')}]`;
  const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined);
  return `{ ${entries.map(([k, v]) => `${JSON.stringify(k)}: ${oneLine(v, seen)}`).join(', ')} }`;
};

export const formatValue = (value: unknown, depth = 0, indent = 2, seen: WeakSet<object> = new WeakSet()): string => {
  const pad = (n: number) => ' '.repeat(n * indent);
  if (typeof value === 'function') return '() => {}';
  if (isShallow(value)) return JSON.stringify(value);
  if (isReactElement(value)) return reactElementLabel(value);
  if (seen.has(value as object)) return '"[Circular]"';
  seen.add(value as object);
  if (Array.isArray(value)) {
    if (value.every(isShallow)) return `[${value.map((v) => JSON.stringify(v)).join(', ')}]`;
    if (value.every((v) => Array.isArray(v) && (v as unknown[]).every(isShallow))) {
      const inner = value.map((v) => `${pad(depth + 1)}[${(v as unknown[]).map((x) => JSON.stringify(x)).join(', ')}]`).join(',\n');
      return `[\n${inner}\n${pad(depth)}]`;
    }
    const lines = value.map((v) => `${pad(depth + 1)}${formatValue(v, depth + 1, indent, seen)}`);
    return `[\n${lines.join(',\n')}\n${pad(depth)}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined);
  const shallow = entries.every(([, v]) => isShallow(v));
  if (shallow && depth > 0) {
    return `{ ${entries.map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(', ')} }`;
  }
  const lines = entries.map(([k, v]) => `${pad(depth + 1)}${JSON.stringify(k)}: ${formatValue(v, depth + 1, indent, seen)}`);
  return `{\n${lines.join(',\n')}\n${pad(depth)}}`;
};
