import '@testing-library/jest-dom';
import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import { Check, Copy } from 'lucide-react';

import { Panel } from '@oc-tech/omni-ui-components/Panel';
import { Transcript, type TranscriptEntry } from '@oc-tech/omni-ui-components/Transcript';
import {
  analysingEntries,
  ComposerExample,
  editedEntries,
  readyEntries,
  transcriptPropsFactory,
  transcriptVariants,
  TranscriptPanel,
} from 'factories/omni-ui-components/Transcript/Transcript.factories';

const slot = (name: string) => document.querySelector(`[data-slot="${name}"]`) as HTMLElement;
const slots = (name: string) => Array.from(document.querySelectorAll(`[data-slot="${name}"]`)) as HTMLElement[];

describe('omni-ui-components/Transcript', () => {
  describe('entry kinds', () => {
    it('renders speech with a tone-coloured `speaker · time` label and the text', () => {
      render(<Transcript {...transcriptPropsFactory({ entries: readyEntries() })} />);
      const speech = slots('transcript-speech');
      expect(speech).toHaveLength(2);
      expect(within(speech[0]).getByText('Mic · 08:21')).toHaveClass('text-[color:var(--oui-tone-success-fg)]');
      expect(within(speech[0]).getByText(/Love to hear why/)).toBeInTheDocument();
    });

    it('the label tone is data', () => {
      const entries: TranscriptEntry[] = [{ id: 'x', kind: 'speech', speaker: 'Interviewer', tone: 'accent', time: '09:00', text: 'Hi' }];
      render(<Transcript entries={entries} />);
      expect(screen.getByText('Interviewer · 09:00')).toHaveClass('text-[color:var(--oui-tone-accent-fg)]');
    });

    it('renders your own message right-aligned at most 85% wide, without a label', () => {
      render(<Transcript entries={analysingEntries()} />);
      const message = slot('transcript-message');
      expect(message).toHaveTextContent('Assume the input is sorted');
      expect(message).toHaveClass('self-end', 'max-w-[85%]');
      expect(slot('transcript-label')?.textContent).not.toMatch(/sorted/);
      expect(within(message).queryByText(/·/)).toBeNull();
    });

    it('renders an event as one centred muted line with its icon node, no bubble', () => {
      render(<Transcript entries={readyEntries()} />);
      const event = slot('transcript-event');
      expect(event).toHaveTextContent('S1 · no question found · 08:33');
      expect(event).toHaveClass('justify-center', 'text-[color:var(--oui-panel-meta-fg)]');
      expect(event.querySelector('svg')).not.toBeNull();
      expect(event.className).not.toMatch(/bg-/);
    });

    it('shows the quiet edited tag only on an edited speech, with a configurable word', () => {
      const { rerender } = render(<Transcript entries={editedEntries()} />);
      const tags = slots('transcript-edited');
      expect(tags).toHaveLength(1);
      expect(tags[0]).toHaveTextContent('edited');
      expect(slots('transcript-speech')[1]).toContainElement(tags[0]);
      rerender(<Transcript entries={editedEntries()} editedLabel="bearbeitet" />);
      expect(slot('transcript-edited')).toHaveTextContent('bearbeitet');
    });

    it('dims an interim speech', () => {
      render(<Transcript entries={editedEntries()} />);
      const interim = slots('transcript-speech')[2];
      expect(interim).toHaveAttribute('data-interim', 'true');
      expect(interim).toHaveClass('italic', 'opacity-70');
    });
  });

  describe('copy', () => {
    const props = (overrides = {}) => transcriptPropsFactory({ entries: analysingEntries(), ...overrides });

    it('has no copy control without onCopy, or without a copy icon', () => {
      const { rerender } = render(<Transcript {...props()} />);
      expect(screen.queryByRole('button')).toBeNull();
      rerender(<Transcript entries={analysingEntries()} onCopy={() => undefined} />);
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('gives each bubble (not events) a ghost copy control named by copyLabel, hidden until hover or focus', () => {
      render(<Transcript {...props({ entries: readyEntries(), onCopy: () => undefined, copyLabel: 'Copy text' })} />);
      const buttons = screen.getAllByRole('button', { name: 'Copy text' });
      expect(buttons).toHaveLength(2);
      expect(buttons[0]).toHaveClass('opacity-0', 'group-hover:opacity-100', 'group-focus-within:opacity-100', 'select-none');
      expect(slot('transcript-event').querySelector('button')).toBeNull();
    });

    it('calls onCopy with the entry, by click and by keyboard', async () => {
      const onCopy = vi.fn();
      render(<Transcript {...props({ onCopy })} />);
      await userEvent.tab();
      expect(screen.getAllByRole('button', { name: 'Copy' })[0]).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      expect(onCopy).toHaveBeenLastCalledWith(analysingEntries()[0]);
      await userEvent.click(screen.getAllByRole('button', { name: 'Copy' })[1]);
      expect(onCopy).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'b', kind: 'message' }));
    });

    it('swaps the label and icon to Copied for copiedId only (controlled, no timer)', () => {
      const { rerender } = render(<Transcript {...props({ onCopy: () => undefined, copiedId: 'b', copiedIcon: <Check data-testid="done" /> })} />);
      expect(screen.getAllByRole('button', { name: 'Copy' })).toHaveLength(1);
      const copied = screen.getByRole('button', { name: 'Copied' });
      expect(copied).toHaveAttribute('data-copied', 'true');
      expect(within(copied).getByTestId('done')).toBeInTheDocument();
      rerender(<Transcript {...props({ onCopy: () => undefined, copiedId: null, copiedLabel: 'Done' })} />);
      expect(screen.queryByRole('button', { name: 'Copied' })).toBeNull();
    });

    it('does not take the text selection: mousedown on the control is prevented', () => {
      render(<Transcript {...props({ onCopy: () => undefined })} />);
      const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      screen.getAllByRole('button', { name: 'Copy' })[0].dispatchEvent(down);
      expect(down.defaultPrevented).toBe(true);
    });
  });

  describe('selection and semantics', () => {
    it('keeps bubble text selectable', () => {
      render(<Transcript {...transcriptPropsFactory({ entries: analysingEntries() })} />);
      expect(slot('transcript-speech')).toHaveClass('select-text');
      expect(slot('transcript-message')).toHaveClass('select-text');
    });

    it('is a named log; the name is configurable', () => {
      const { rerender } = render(<Transcript entries={[]} />);
      expect(screen.getByRole('log', { name: 'Transcript' })).toBeInTheDocument();
      rerender(<Transcript entries={[]} aria-label="Live captions" />);
      expect(screen.getByRole('log', { name: 'Live captions' })).toBeInTheDocument();
    });

    it('is plain data: every variant renders without throwing', () => {
      for (const variant of transcriptVariants) {
        const { unmount } = render(<Transcript {...transcriptPropsFactory(variant.args)} />);
        expect(slot('transcript')).toBeInTheDocument();
        unmount();
      }
    });

    it('works as Panel children and leaves scrolling to the Panel', () => {
      render(
        <Panel title="Transcript & chat" scroll={{ stickToBottom: true, lines: 3 }}>
          <Transcript entries={readyEntries()} />
        </Panel>,
      );
      expect(slot('panel-body')).toContainElement(slot('transcript'));
      expect(slot('panel-body')).toHaveAttribute('data-following', 'true');
      expect(slot('transcript').className).not.toMatch(/overflow-/);
    });
  });

  describe('TranscriptPanel demo copy flow', () => {
    it('reports copy and shows Copied afterwards', async () => {
      const onAction = vi.fn();
      render(<TranscriptPanel entries={analysingEntries()} onAction={onAction} />);
      await userEvent.click(screen.getAllByRole('button', { name: 'Copy' })[0]);
      expect(onAction).toHaveBeenCalledWith('copy', 'a');
      expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
    });
  });
});

describe('omni-ui-components/Input as a composer (variant panel + actions)', () => {
  it('renders the field and the actions slot in one row', () => {
    render(<ComposerExample />);
    const row = slot('input-row');
    expect(within(row).getByRole('textbox', { name: 'Message' })).toHaveAttribute('data-variant', 'panel');
    expect(within(slot('input-actions')).getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual(['Dictate', 'Send']);
  });

  it('follows the see-through token on the field background only', () => {
    render(<ComposerExample />);
    const field = screen.getByRole('textbox', { name: 'Message' });
    expect(field.className).toContain('color-mix(in_srgb,var(--oui-panel-dock-bg)_calc(var(--oui-panel-see-through,1)_*_100%),transparent)');
    expect(field).toHaveClass('text-[var(--oui-foreground)]');
  });

  it('keeps send muted (disabled) until the field has text, and Enter sends and clears', async () => {
    const onAction = vi.fn();
    render(<ComposerExample onAction={onAction} />);
    const send = screen.getByRole('button', { name: 'Send' });
    expect(send).toBeDisabled();
    const field = screen.getByRole('textbox', { name: 'Message' });
    await userEvent.type(field, '   ');
    expect(send).toBeDisabled();
    await userEvent.type(field, 'Hello{Enter}');
    expect(onAction).toHaveBeenCalledWith('send', 'Hello');
    expect(field).toHaveValue('');
    expect(send).toBeDisabled();
    await userEvent.type(field, 'Again');
    expect(send).toBeEnabled();
    await userEvent.click(send);
    expect(onAction).toHaveBeenLastCalledWith('send', 'Again');
  });

  it('the mic is neutral and unpressed until dictating, then danger and pressed', async () => {
    const onAction = vi.fn();
    render(<ComposerExample onAction={onAction} />);
    const mic = screen.getByRole('button', { name: 'Dictate' });
    expect(mic).toHaveAttribute('aria-pressed', 'false');
    expect(mic).not.toHaveAttribute('data-tone');
    await userEvent.click(mic);
    expect(mic).toHaveAttribute('aria-pressed', 'true');
    expect(mic).toHaveAttribute('data-tone', 'danger');
    expect(mic.className).toContain('aria-pressed:text-[color:var(--oui-tone-danger-fg)]');
    expect(onAction).toHaveBeenLastCalledWith('mic', true);
    await userEvent.click(mic);
    expect(mic).not.toHaveAttribute('data-tone');
  });

  it('starts dictating when asked to', () => {
    render(<ComposerExample dictating />);
    expect(screen.getByRole('button', { name: 'Dictate' })).toHaveAttribute('aria-pressed', 'true');
  });
});

it('a Copy icon is just a node: any element works', () => {
  render(<Transcript entries={analysingEntries()} onCopy={() => undefined} copyIcon={<Copy data-testid="c" />} />);
  expect(screen.getAllByTestId('c')).toHaveLength(2);
});
