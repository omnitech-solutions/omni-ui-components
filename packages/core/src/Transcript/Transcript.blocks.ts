import type { TranscriptBlock } from './Transcript.types';

const FENCE = /^```([^\n`]*)\n([\s\S]*?)\n?```[ \t]*$/gm;

/** The id a code block's copy control answers to in `copiedId` and in the `onCopyCode` call: `<entryId>#<index>`. */
export const codeBlockId = (entryId: string, index: number): string => `${entryId}#${index}`;

/**
 * Splits markdown-style text into text and code blocks. A fence is a line starting with three backticks (an optional
 * language after them) up to the next line of three backticks. An unclosed fence stays text, so a half-streamed
 * reply never swallows the rest of the message. Empty text parts are dropped.
 *
 * @example
 * parseFencedBlocks('Try this:\n```ts\nconst a = 1;\n```\nDone.');
 * // [{ type: 'text', text: 'Try this:' }, { type: 'code', language: 'ts', code: 'const a = 1;' }, { type: 'text', text: 'Done.' }]
 */
export function parseFencedBlocks(source: string): TranscriptBlock[] {
  const blocks: TranscriptBlock[] = [];
  let last = 0;
  for (const match of source.matchAll(FENCE)) {
    const start = match.index ?? 0;
    const before = source.slice(last, start).trim();
    if (before) blocks.push({ type: 'text', text: before });
    const language = match[1]?.trim();
    blocks.push({ type: 'code', code: match[2] ?? '', ...(language ? { language } : {}) });
    last = start + match[0].length;
  }
  const rest = source.slice(last).trim();
  if (rest || blocks.length === 0) blocks.push({ type: 'text', text: rest });
  return blocks;
}
