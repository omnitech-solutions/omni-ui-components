import { common, createLowlight } from 'lowlight';
import type { Element, ElementContent, Root } from 'hast';

import type { CodeToken, HighlightFn, HighlightOptions } from './Highlight.types';

/** Built-in aliases for the names people put after a code fence. */
export const DEFAULT_LANGUAGE_ALIASES: Readonly<Record<string, string>> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  py: 'python',
  rb: 'ruby',
  yml: 'yaml',
  html: 'xml',
  md: 'markdown',
  rs: 'rust',
  golang: 'go',
  'c++': 'cpp',
  'c#': 'csharp',
  cs: 'csharp',
};

// Created on first use, not at import: the grammars are the heavy part, and a host that never highlights pays nothing.
let shared: ReturnType<typeof createLowlight> | undefined;
const lowlight = () => (shared ??= createLowlight(common));

function flatten(nodes: readonly ElementContent[], classes: string[], out: CodeToken[]): void {
  for (const node of nodes) {
    if (node.type === 'text') {
      out.push({ text: node.value, ...(classes.length ? { className: classes.join(' ') } : {}) });
    } else if (node.type === 'element') {
      const own = (node as Element).properties?.className;
      flatten(node.children, [...classes, ...(Array.isArray(own) ? own.map(String) : [])], out);
    }
  }
}

/** One plain, unstyled token per line: what unknown languages and failures fall back to. */
export const plainLines = (code: string): CodeToken[][] => code.split('\n').map((line) => (line ? [{ text: line }] : []));

/**
 * Highlights `code` with highlight.js grammars (via lowlight, the `common` set) and returns one token list per
 * line, so code can be rendered line by line (line numbers, per-line marks, diffs). Colours are not decided here:
 * tokens carry `hljs-*` classes and the stylesheet (`--oui-code-*` tokens) paints them, so light and dark follow
 * the theme. Never throws: any failure returns plain lines.
 *
 * @example
 * highlightLines('const a = 1;', 'ts')[0]; // [{ text: 'const', className: 'hljs-keyword' }, { text: ' a = ' }, ...]
 */
export function highlightLines(code: string, language?: string, options: HighlightOptions = {}): CodeToken[][] {
  const key = language?.trim().toLowerCase();
  const name = key ? (options.aliases?.[key] ?? DEFAULT_LANGUAGE_ALIASES[key] ?? key) : undefined;
  const engine = lowlight();
  let tree: Root;
  try {
    if (name && engine.registered(name)) tree = engine.highlight(name, code);
    else if (options.auto) tree = engine.highlightAuto(code);
    else return plainLines(code);
  } catch {
    return plainLines(code);
  }
  const tokens: CodeToken[] = [];
  flatten(tree.children as ElementContent[], [], tokens);
  const lines: CodeToken[][] = [[]];
  for (const token of tokens) {
    token.text.split('\n').forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part) lines[lines.length - 1]!.push({ ...token, text: part });
    });
  }
  return lines;
}

/** A {@link HighlightFn} with options fixed, e.g. `createHighlighter({ auto: true })`. */
export const createHighlighter =
  (options: HighlightOptions = {}): HighlightFn =>
  (code, language) =>
    highlightLines(code, language, options);
