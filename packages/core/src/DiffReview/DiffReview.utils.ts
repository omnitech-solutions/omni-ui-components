import { diffLines } from 'diff';

import type { CodeToken } from '../Highlight';
import type { DiffRow, DiffRowsOptions, DiffStats } from './DiffReview.types';

/** Added and removed line counts between two texts. */
export function diffStats(before: string, after: string): DiffStats {
  let added = 0;
  let removed = 0;
  for (const part of diffLines(before, after, { ignoreNewlineAtEof: true })) {
    const lines = part.count ?? part.value.split('\n').length - 1;
    if (part.added) added += lines;
    if (part.removed) removed += lines;
  }
  return { added, removed };
}

/** The sum of the stats of several changes. */
export const sumStats = (changes: readonly { before: string; after: string }[]): DiffStats =>
  changes.reduce<DiffStats>(
    (sum, change) => {
      const next = diffStats(change.before, change.after);
      return { added: sum.added + next.added, removed: sum.removed + next.removed };
    },
    { added: 0, removed: 0 },
  );

/**
 * The rows of a unified diff: every changed line plus `contextLines` unchanged lines on each side, with one `gap`
 * row wherever lines were left out. Tokens come from the highlighter when given, else one plain token per line.
 */
export function diffRows(
  before: string,
  after: string,
  { highlight, language, contextLines = 1 }: DiffRowsOptions = {},
): DiffRow[] {
  const lines: { kind: 'add' | 'remove' | 'context'; text: string }[] = [];
  for (const part of diffLines(before, after, { ignoreNewlineAtEof: true })) {
    const kind = part.added ? 'add' : part.removed ? 'remove' : 'context';
    for (const text of part.value.replace(/\n$/, '').split('\n')) lines.push({ kind, text });
  }
  // A line is kept when it changed or sits within `contextLines` of a changed one.
  const changedAt = lines.flatMap((line, index) => (line.kind === 'context' ? [] : [index]));
  const keep = lines.map((_, index) =>
    changedAt.some((at) => Math.abs(at - index) <= contextLines),
  );
  const tokens: CodeToken[][] | undefined = highlight?.(
    lines.map((line) => line.text).join('\n'),
    language,
  );

  const rows: DiffRow[] = [];
  let last = -1;
  lines.forEach((line, index) => {
    if (!keep[index]) return;
    if (last >= 0 && index > last + 1) rows.push({ kind: 'gap' });
    last = index;
    rows.push({
      kind: line.kind,
      tokens: tokens?.[index] ?? (line.text ? [{ text: line.text }] : []),
    });
  });
  return rows;
}
