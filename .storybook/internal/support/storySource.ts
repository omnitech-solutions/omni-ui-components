/**
 * A story as it is written in its file (`{ render: () => (<Button />), play: … }`, what Storybook keeps as the
 * story's original source), reduced to the example it renders: the JSX of an arrow that returns JSX, or the
 * whole function as `const Example = …` when it has a body (state, handlers). A story that has no `render` is
 * returned as it is written.
 */
export function storySourceToExample(source: string): string {
  // `render` is the story's first property, or a later one at the story's own indentation.
  const head = /(?:^\{\s*|\n {2})render:\s*(\([^)]*\)|\w+)\s*=>\s*/.exec(source);
  if (!head) return source;
  const start = head.index + head[0].length;
  const open = source[start];
  if (open === '<') {
    // JSX with no brackets around it (as Storybook prints a story): it ends where the story's next property
    // starts, or with the story itself.
    const rest = source.slice(start);
    const next = /,\n {2}[\w$]+\s*[:(]/.exec(rest);
    const end = next ? next.index : rest.lastIndexOf('\n}');
    return end > 0 ? dedent(rest.slice(0, end)) : source;
  }
  if (open !== '(' && open !== '{') return source;
  const end = matching(source, start);
  if (end === -1) return source;
  if (open === '(') return dedent(source.slice(start + 1, end));
  return `const Example = ${head[1]} => ${dedent(source.slice(start, end + 1))};`;
}

/** Index of the bracket that closes the one at `from`, skipping strings and template literals; -1 when unbalanced. */
function matching(source: string, from: number): number {
  const pairs: Record<string, string> = { '(': ')', '{': '}', '[': ']' };
  const stack: string[] = [];
  for (let at = from; at < source.length; at += 1) {
    const char = source[at] as string;
    if (char === "'" || char === '"' || char === '`') {
      // An apostrophe in JSX text is not a string: only skip when the quote closes on the same line.
      const close = source.indexOf(char, at + 1);
      const line = source.indexOf('\n', at + 1);
      if (close !== -1 && (char === '`' || line === -1 || close < line)) at = close;
      continue;
    }
    if (pairs[char]) stack.push(pairs[char]);
    else if (char === stack[stack.length - 1]) {
      stack.pop();
      if (stack.length === 0) return at;
    }
  }
  return -1;
}

/** The text without the indentation its lines share, and without blank lines at either end. */
function dedent(text: string): string {
  const lines = text
    .replace(/^\s*\n/, '')
    .replace(/\s+$/, '')
    .split('\n');
  // The first line follows the bracket on its own line, or shares the bracket's line and carries no indentation.
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => /^\s*/.exec(line)?.[0].length ?? 0);
  const rest = indents.length > 1 && indents[0] === 0 ? indents.slice(1) : indents;
  const shared = Math.min(...rest);
  return lines
    .map((line, index) => (index === 0 && indents[0] === 0 ? line : line.slice(shared)))
    .join('\n')
    .trim();
}
