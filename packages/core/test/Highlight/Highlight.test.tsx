import '@testing-library/jest-dom';

import {
  createHighlighter,
  DEFAULT_LANGUAGE_ALIASES,
  highlightLines,
  plainLines,
  TokenLines,
} from '@oc-tech/omni-ui-components/Highlight';
import { Transcript } from '@oc-tech/omni-ui-components/Transcript';
import { render } from '@testing-library/react';

const flat = (lines: ReturnType<typeof highlightLines>) => lines.flat();

describe('omni-ui-components/Highlight', () => {
  describe('highlightLines', () => {
    it('returns one token list per line and classes for keywords, strings and numbers', () => {
      const lines = highlightLines('const a = 1;\nreturn "x";', 'ts');
      expect(lines).toHaveLength(2);
      expect(lines[0].find((t) => t.text === 'const')?.className).toContain('hljs-keyword');
      expect(flat(lines).find((t) => t.text === '1')?.className).toContain('hljs-number');
      expect(flat(lines).find((t) => t.text.includes('"x"'))?.className).toContain('hljs-string');
    });

    it('round-trips the text exactly (copy must not change the code)', () => {
      const code = 'function f(a, b) {\n  // note\n  return a + b;\n}\n';
      const text = highlightLines(code, 'js')
        .map((line) => line.map((t) => t.text).join(''))
        .join('\n');
      expect(text).toBe(code);
    });

    it('resolves aliases, case-insensitively, and accepts host aliases', () => {
      expect(DEFAULT_LANGUAGE_ALIASES.ts).toBe('typescript');
      expect(
        flat(highlightLines('const a = 1', 'TS')).some((t) =>
          t.className?.includes('hljs-keyword'),
        ),
      ).toBe(true);
      expect(
        flat(highlightLines('const a = 1', 'mylang', { aliases: { mylang: 'javascript' } })).some(
          (t) => t.className,
        ),
      ).toBe(true);
    });

    it('keeps unknown languages and no language as plain text unless `auto` is on', () => {
      expect(highlightLines('some words here', 'nonsense-lang')).toEqual([
        [{ text: 'some words here' }],
      ]);
      expect(highlightLines('some words here')).toEqual([[{ text: 'some words here' }]]);
      expect(
        flat(highlightLines('const a = 1;\nfunction f() {}', undefined, { auto: true })).some(
          (t) => t.className,
        ),
      ).toBe(true);
    });

    it('never throws: bad input falls back to plain lines', () => {
      expect(() => highlightLines('x', 'typescript')).not.toThrow();
      expect(plainLines('a\n\nb')).toEqual([[{ text: 'a' }], [], [{ text: 'b' }]]);
    });

    it('createHighlighter fixes the options', () => {
      const guess = createHighlighter({ auto: true });
      expect(flat(guess('const a = 1;\nfunction f() {}')).some((t) => t.className)).toBe(true);
    });
  });

  describe('TokenLines', () => {
    it('renders a block span per line with classed tokens', () => {
      const { container } = render(
        <TokenLines lines={highlightLines('const a = 1;\nlet b;', 'ts')} />,
      );
      expect(container.querySelectorAll('[data-slot="code-line"]')).toHaveLength(2);
      expect(container.querySelector('.hljs-keyword')).toHaveTextContent('const');
      expect(container.querySelector('[data-slot="code-line-number"]')).toBeNull();
    });

    it('shows a non-selectable gutter and marks lines when asked', () => {
      const { container } = render(
        <TokenLines lines={plainLines('a\nb\nc')} lineNumbers markedLines={[2]} />,
      );
      const numbers = container.querySelectorAll('[data-slot="code-line-number"]');
      expect(numbers).toHaveLength(3);
      expect(numbers[0]).toHaveAttribute('aria-hidden', 'true');
      expect(numbers[0]).toHaveClass('select-none');
      expect(container.querySelectorAll('[data-marked="true"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-slot="code-line"]')[1]).toHaveAttribute(
        'data-marked',
        'true',
      );
    });
  });

  describe('Transcript highlight prop', () => {
    const entries = [
      {
        id: 'a',
        kind: 'speech' as const,
        speaker: 'A',
        time: '1',
        text: 'Here:\n```ts\nconst a = 1;\n```',
      },
    ];

    it('paints tokens through the highlighter when given, and stays plain without it', () => {
      const { container, rerender } = render(
        <Transcript entries={entries} fences highlight={highlightLines} />,
      );
      expect(
        container.querySelector('[data-slot="transcript-code"] .hljs-keyword'),
      ).toHaveTextContent('const');
      rerender(<Transcript entries={entries} fences />);
      expect(container.querySelector('.hljs-keyword')).toBeNull();
      expect(container.querySelector('[data-slot="transcript-code"] code')).toHaveTextContent(
        'const a = 1;',
      );
    });

    it('renderCode wins over highlight, and line numbers are opt-in', () => {
      const { container, rerender } = render(
        <Transcript
          entries={entries}
          fences
          highlight={highlightLines}
          renderCode={() => <mark data-testid="own">x</mark>}
        />,
      );
      expect(container.querySelector('[data-testid="own"]')).not.toBeNull();
      expect(container.querySelector('.hljs-keyword')).toBeNull();
      rerender(<Transcript entries={entries} fences highlight={highlightLines} codeLineNumbers />);
      expect(container.querySelector('[data-slot="code-line-number"]')).toHaveTextContent('1');
    });
  });
});
