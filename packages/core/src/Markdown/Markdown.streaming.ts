const FENCE_LINE = /^ {0,3}(`{3,}|~{3,})(.*)$/;

/**
 * Closes what a half-streamed reply leaves open, for display only (the stored text is never changed):
 * an unclosed code fence gets its closing fence, then an unclosed inline code span or `**` in the last paragraph
 * gets its closer. Complete markdown comes back unchanged. Code is never touched by the emphasis rule.
 *
 * @example
 * closeOpenMarkdown('Try:\n```ts\nconst a = 1;'); // 'Try:\n```ts\nconst a = 1;\n```'
 * closeOpenMarkdown('This is **bold');             // 'This is **bold**'
 */
export function closeOpenMarkdown(source: string): string {
  const lines = source.split('\n');
  let fence: { marker: string } | null = null;
  for (const line of lines) {
    const match = FENCE_LINE.exec(line);
    if (!match) continue;
    const run = match[1] ?? '';
    if (!fence) fence = { marker: run };
    // A closing fence is the same character, at least as long, with nothing after it.
    else if (
      run[0] === fence.marker[0] &&
      run.length >= fence.marker.length &&
      !(match[2] ?? '').trim()
    )
      fence = null;
  }
  if (fence) return `${source}${source.endsWith('\n') ? '' : '\n'}${fence.marker}`;

  // Only the last paragraph can still be open; look at it outside complete code spans.
  const start = source.lastIndexOf('\n\n') + 1;
  const tail = source.slice(start);
  const withoutSpans = tail.replace(/(`+)[^`]*?\1/g, '');
  let closer = '';
  const tick = /`+/.exec(withoutSpans);
  if (tick) closer += tick[0];
  const emphasisSource = tick ? withoutSpans.slice(0, tick.index) : withoutSpans;
  if ((emphasisSource.match(/\*\*/g) ?? []).length % 2 === 1) closer = `**${closer}`;
  return closer ? source + closer : source;
}
