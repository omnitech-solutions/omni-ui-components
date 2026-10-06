import '@testing-library/jest-dom';
import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import { Check, Copy } from 'lucide-react';

import {
  codeBlockId,
  parseFencedBlocks,
  Transcript,
  type TranscriptEntry,
  type TranscriptProps,
} from '@oc-tech/omni-ui-components/Transcript';
import { codeEntries } from 'factories/omni-ui-components/Transcript/Transcript.factories';

const slot = (name: string) => document.querySelector(`[data-slot="${name}"]`) as HTMLElement;
const slots = (name: string) => Array.from(document.querySelectorAll(`[data-slot="${name}"]`)) as HTMLElement[];
const base = (overrides: Partial<TranscriptProps> = {}): TranscriptProps => ({
  entries: codeEntries(),
  copyIcon: <Copy />,
  copiedIcon: <Check />,
  fences: true,
  ...overrides,
});

describe('omni-ui-components/Transcript code blocks', () => {
  describe('parseFencedBlocks', () => {
    it('splits prose, code and prose, keeping the language', () => {
      expect(parseFencedBlocks('Try this:\n```ts\nconst a = 1;\n```\nDone.')).toEqual([
        { type: 'text', text: 'Try this:' },
        { type: 'code', language: 'ts', code: 'const a = 1;' },
        { type: 'text', text: 'Done.' },
      ]);
    });

    it('allows a fence with no language and several fences', () => {
      const blocks = parseFencedBlocks('```\na\n```\n```py\nb\n```');
      expect(blocks).toEqual([
        { type: 'code', code: 'a' },
        { type: 'code', language: 'py', code: 'b' },
      ]);
    });

    it('leaves an unclosed fence as text, so a half-streamed reply keeps its prose', () => {
      expect(parseFencedBlocks('Here:\n```ts\nconst a')).toEqual([{ type: 'text', text: 'Here:\n```ts\nconst a' }]);
    });

    it('returns one text block for plain text, and an empty one for empty text', () => {
      expect(parseFencedBlocks('Hello')).toEqual([{ type: 'text', text: 'Hello' }]);
      expect(parseFencedBlocks('')).toEqual([{ type: 'text', text: '' }]);
    });

    it('builds the copy id as entry#index', () => {
      expect(codeBlockId('a', 1)).toBe('a#1');
    });
  });

  describe('rendering', () => {
    it('draws fenced code as a block with the language label and monospace code', () => {
      render(<Transcript {...base()} />);
      const code = slot('transcript-code');
      expect(within(slot('transcript-code-header')).getByText('ts')).toBeInTheDocument();
      expect(code.querySelector('pre')).toHaveClass('font-mono', 'select-text', 'overflow-x-auto', 'whitespace-pre');
      expect(code).toHaveTextContent('function twoSum');
      expect(screen.getByText('One pass with a map.')).toBeInTheDocument();
      expect(screen.getByText('O(n) time, O(n) space.')).toBeInTheDocument();
    });

    it('keeps the text plain when `fences` is off', () => {
      render(<Transcript {...base({ fences: false })} />);
      expect(slot('transcript-code')).toBeNull();
      expect(screen.getByText(/```ts/)).toBeInTheDocument();
    });

    it('explicit blocks win over `text`, and a title replaces the language', () => {
      const entries: TranscriptEntry[] = [
        {
          id: 'x',
          kind: 'speech',
          speaker: 'Assistant',
          time: '1:00',
          text: 'raw',
          blocks: [
            { type: 'text', text: 'Here you go' },
            { type: 'code', language: 'ts', title: 'two-sum.ts', code: 'export {}' },
          ],
        },
      ];
      render(<Transcript entries={entries} />);
      expect(within(slot('transcript-code-header')).getByText('two-sum.ts')).toBeInTheDocument();
      expect(screen.queryByText('raw')).toBeNull();
    });

    it('a message with code takes the full width instead of 85%', () => {
      const entries: TranscriptEntry[] = [{ id: 'm', kind: 'message', text: '```js\n1\n```' }];
      render(<Transcript entries={entries} fences />);
      expect(slot('transcript-message')).toHaveAttribute('data-has-code', 'true');
      expect(slot('transcript-message')).toHaveClass('max-w-full', 'self-stretch');
    });

    it('wrapCode wraps instead of scrolling', () => {
      render(<Transcript {...base({ wrapCode: true })} />);
      const pre = slot('transcript-code').querySelector('pre');
      expect(pre).toHaveClass('whitespace-pre-wrap', 'break-words');
      expect(pre).not.toHaveClass('overflow-x-auto');
    });

    it('the code background follows the see-through token, not the text', () => {
      render(<Transcript {...base()} />);
      expect(slot('transcript-code').className).toContain('--oui-panel-see-through');
      expect(slot('transcript-code').querySelector('pre')?.className).not.toContain('see-through');
    });

    it('renderCode replaces the plain code text with the host highlighter', () => {
      render(<Transcript {...base({ renderCode: (block) => <mark data-testid="hl">{block.code.toUpperCase()}</mark> })} />);
      expect(screen.getByTestId('hl')).toHaveTextContent('FUNCTION TWOSUM');
    });
  });

  describe('copy and accessibility', () => {
    it('copying a block calls onCopyCode with the block, entry and index, without taking a text selection', async () => {
      const onCopyCode = vi.fn();
      render(<Transcript {...base({ onCopyCode })} />);
      const button = within(slot('transcript-code')).getByRole('button', { name: 'Copy code' });
      const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      button.dispatchEvent(down);
      expect(down.defaultPrevented).toBe(true);
      await userEvent.click(button);
      expect(onCopyCode).toHaveBeenCalledTimes(1);
      const [block, entry, index] = onCopyCode.mock.calls[0];
      expect(block).toMatchObject({ type: 'code', language: 'ts' });
      expect(block.code).toContain('twoSum');
      expect(entry.id).toBe('a');
      expect(index).toBe(1);
    });

    it('shows Copied on the block whose id is copiedId, and only that block', () => {
      const entries: TranscriptEntry[] = [{ id: 'e', kind: 'speech', speaker: 'A', time: '1', text: '```a\n1\n```\n```b\n2\n```' }];
      render(<Transcript entries={entries} fences copyIcon={<Copy />} copiedIcon={<Check />} onCopyCode={() => undefined} copiedId={codeBlockId('e', 1)} />);
      const buttons = slots('transcript-code-copy');
      expect(buttons[0]).toHaveAccessibleName('Copy code');
      expect(buttons[1]).toHaveAccessibleName('Copied');
    });

    it('labels are configurable', () => {
      render(<Transcript {...base({ onCopyCode: () => undefined, copyCodeLabel: 'Copiar código' })} />);
      expect(screen.getByRole('button', { name: 'Copiar código' })).toBeInTheDocument();
    });

    it('has no code copy control without onCopyCode or without a copy icon', () => {
      const { rerender } = render(<Transcript {...base()} />);
      expect(slot('transcript-code-copy')).toBeNull();
      rerender(<Transcript {...base({ onCopyCode: () => undefined, copyIcon: undefined })} />);
      expect(slot('transcript-code-copy')).toBeNull();
    });

    it('the code region is keyboard-scrollable and named by its language', () => {
      render(<Transcript {...base()} />);
      const pre = slot('transcript-code').querySelector('pre');
      expect(pre).toHaveAttribute('tabindex', '0');
      expect(pre).toHaveAccessibleName('ts code');
    });
  });
});
