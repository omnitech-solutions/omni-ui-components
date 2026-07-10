const isShallow = (v: unknown) => v === null || typeof v !== 'object';

/** JSON-like serializer that keeps leaf objects and primitive arrays inline. */
export const formatValue = (value: unknown, depth = 0, indent = 2): string => {
  const pad = (n: number) => ' '.repeat(n * indent);
  if (isShallow(value)) return JSON.stringify(value);
  if (Array.isArray(value)) {
    if (value.every(isShallow)) return `[${value.map((v) => JSON.stringify(v)).join(', ')}]`;
    if (value.every((v) => Array.isArray(v) && (v as unknown[]).every(isShallow))) {
      const inner = value.map((v) => `${pad(depth + 1)}[${(v as unknown[]).map((x) => JSON.stringify(x)).join(', ')}]`).join(',\n');
      return `[\n${inner}\n${pad(depth)}]`;
    }
    const lines = value.map((v) => `${pad(depth + 1)}${formatValue(v, depth + 1, indent)}`);
    return `[\n${lines.join(',\n')}\n${pad(depth)}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>);
  const shallow = entries.every(([, v]) => isShallow(v));
  if (shallow && depth > 0) {
    return `{ ${entries.map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(', ')} }`;
  }
  const lines = entries.map(([k, v]) => `${pad(depth + 1)}${JSON.stringify(k)}: ${formatValue(v, depth + 1, indent)}`);
  return `{\n${lines.join(',\n')}\n${pad(depth)}}`;
};
