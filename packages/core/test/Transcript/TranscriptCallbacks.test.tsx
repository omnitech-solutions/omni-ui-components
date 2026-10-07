import '@testing-library/jest-dom';
import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { act, render, screen, within } from '@testing-library/react';
import { Copy, Pencil } from 'lucide-react';

import {
  Transcript,
  type ChatAttachmentPart,
  type ChatVersion,
  type ConversationTurn,
  type TranscriptSpeech,
} from '@oc-tech/omni-ui-components/Transcript';
import { failedTurns } from 'factories/omni-ui-components/Transcript/Transcript.factories';

interface MyTurn extends ConversationTurn {
  threadRef: string;
}
interface MyVersion extends ChatVersion {
  createdBy: string;
}
interface MyAttachment extends ChatAttachmentPart {
  uploadId: string;
}
interface MyEntry extends TranscriptSpeech {
  source: string;
}

const attachment: MyAttachment = { type: 'attachment', kind: 'file', id: 'att', name: 'notes.md', uploadId: 'up-1' };
const v1: MyVersion = { id: 'u1', createdBy: 'me' };
const v2: MyVersion = { id: 'u1b', createdBy: 'bot' };
const mk = (): MyTurn[] => [
  {
    id: 'u1',
    threadRef: 't-1',
    user: { id: 'u1', role: 'user', createdAt: '2026-10-06T09:00:00Z', siblings: [v1, v2], parts: [attachment, { type: 'text', text: 'first question' }] },
    answer: { first: { id: 'a1', role: 'assistant', createdAt: '2026-10-06T09:00:05Z', parts: [] }, text: 'an answer', steps: [], sources: [], suggestions: [], partial: false, proposalIds: [] },
    run: { id: 'r1', status: 'completed', userMessageId: 'u1' },
  },
  {
    id: 'u2',
    threadRef: 't-2',
    user: { id: 'u2', role: 'user', createdAt: '2026-10-06T09:01:00Z', parts: [{ type: 'text', text: 'second question' }] },
    run: { id: 'r2', status: 'failed', userMessageId: 'u2', error: { code: 'x', message: 'It broke' } },
  },
];

describe('omni-ui-components/Transcript callbacks (items by reference)', () => {
  it('entries mode: onCopy and onCopyCode get the SAME entry, with its extra field visible', async () => {
    const entry: MyEntry = { id: 'e1', kind: 'speech', speaker: 'Mic', time: '08:00', text: 'a\n```ts\nx\n```', source: 'mic-1' };
    const seen: string[] = [];
    const onCopy = vi.fn((e: MyEntry): void => void seen.push(e.source));
    const onCopyCode = vi.fn((_block: unknown, e: MyEntry, index: number): void => void seen.push(`${e.source}:${index}`));
    render(<Transcript<MyEntry> entries={[entry]} copyIcon={<Copy />} onCopy={onCopy} onCopyCode={onCopyCode} fences />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy' }));
    await userEvent.click(screen.getByRole('button', { name: 'Copy code' }));
    expect(onCopy.mock.calls[0][0]).toBe(entry);
    expect(seen[0]).toBe('mic-1');
    expect(onCopyCode.mock.calls[0][1]).toBe(entry);
    expect(seen[1]).toBe('mic-1:1');
  });

  it('onLoadEarlier gets the first (oldest) turn by reference', async () => {
    const turns = mk();
    const seen: (string | undefined)[] = [];
    const onLoadEarlier = vi.fn((oldest: MyTurn | undefined): void => void seen.push(oldest?.threadRef));
    render(<Transcript<never, MyTurn> turns={turns} hasEarlier onLoadEarlier={onLoadEarlier} />);
    await userEvent.click(screen.getByRole('button', { name: 'Load earlier messages' }));
    expect(onLoadEarlier.mock.calls[0][0]).toBe(turns[0]);
    expect(seen).toEqual(['t-1']);
  });

  it('onEditStart / onEditSubmit / onEditCancel get the same turn', async () => {
    const turns = mk();
    const seen: string[] = [];
    const onEditStart = vi.fn((turn: MyTurn): void => void seen.push(`start:${turn.threadRef}`));
    const onEditSubmit = vi.fn((turn: MyTurn, text: string): void => void seen.push(`submit:${turn.threadRef}:${text}`));
    const onEditCancel = vi.fn((turn: MyTurn): void => void seen.push(`cancel:${turn.threadRef}`));
    render(<Transcript<never, MyTurn> turns={turns} editIcon={<Pencil />} onEditStart={onEditStart} onEditSubmit={onEditSubmit} onEditCancel={onEditCancel} />);
    const first = document.querySelector('[data-turn-id="u1"]') as HTMLElement;
    await userEvent.click(within(first).getByRole('button', { name: 'Edit and resend' }));
    expect(onEditStart.mock.calls[0][0]).toBe(turns[0]);
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onEditSubmit.mock.calls[0][0]).toBe(turns[0]);
    expect(onEditSubmit.mock.calls[0][1]).toBe('first question');
    await userEvent.click(within(first).getByRole('button', { name: 'Edit and resend' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onEditCancel.mock.calls[0][0]).toBe(turns[0]);
    expect(seen).toEqual(['start:t-1', 'submit:t-1:first question', 'start:t-1', 'cancel:t-1']);
  });

  it('onEditChange fires uncontrolled and controlled', async () => {
    const onEditChange = vi.fn();
    render(<Transcript<never, MyTurn> turns={mk()} onEditSubmit={() => undefined} onEditChange={onEditChange} />);
    await userEvent.click(within(document.querySelector('[data-turn-id="u1"]') as HTMLElement).getByRole('button', { name: 'Edit and resend' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Edit message' }), '!');
    expect(onEditChange).toHaveBeenLastCalledWith('first question!');
  });

  it('onRetry gets the turn (default error Retry button) and the slot context retry() fires it too; absent: no Retry', async () => {
    const turns = mk();
    const onRetry = vi.fn();
    const { rerender } = render(<Transcript<never, MyTurn> turns={turns} onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry.mock.calls[0][0]).toBe(turns[1]);
    rerender(<Transcript<never, MyTurn> turns={turns} onRetry={onRetry} slots={{ error: (_turn, context) => <button onClick={context.retry}>slot retry</button> }} />);
    await userEvent.click(screen.getByRole('button', { name: 'slot retry' }));
    expect(onRetry.mock.calls[1][0]).toBe(turns[1]);
    rerender(<Transcript<never, MyTurn> turns={turns} />);
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
  });

  it('onRegenerate is reachable through context.regenerate() with the turn, absent when not set', async () => {
    const turns = mk();
    const onRegenerate = vi.fn();
    const seen: unknown[] = [];
    render(<Transcript<never, MyTurn> turns={turns} onRegenerate={onRegenerate} slots={{ actions: (_t, context) => <button onClick={context.regenerate}>regen</button> }} />);
    await userEvent.click(screen.getByRole('button', { name: 'regen' }));
    expect(onRegenerate.mock.calls[0][0]).toBe(turns[0]);
    seen.push(onRegenerate);
    render(<Transcript<never, MyTurn> turns={turns} slots={{ actions: (_t, context) => <i data-testid="has">{String(Boolean(context.regenerate))}</i> }} />);
    expect(screen.getByTestId('has')).toHaveTextContent('false');
  });

  it('onSelectVersion gets the turn and the SAME version object from the pager and from context.selectVersion', async () => {
    const turns = mk();
    const seen: string[] = [];
    const onSelectVersion = vi.fn((turn: MyTurn, version: MyVersion): void => void seen.push(`${turn.threadRef}:${version.createdBy}`));
    render(<Transcript<never, MyTurn, MyVersion> turns={turns} onSelectVersion={onSelectVersion} slots={{ actions: (_t, context) => <button onClick={() => context.selectVersion?.(v1)}>pick v1</button> }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Next version' }));
    expect(onSelectVersion.mock.calls[0][0]).toBe(turns[0]);
    expect(onSelectVersion.mock.calls[0][1]).toBe(v2);
    expect(seen[0]).toBe('t-1:bot');
    await userEvent.click(screen.getByRole('button', { name: 'pick v1' }));
    expect(onSelectVersion.mock.calls[1][1]).toBe(v1);
  });

  it('onAttachmentClick gets the SAME attachment part; absent: chips are not buttons', async () => {
    const seen: string[] = [];
    const onAttachmentClick = vi.fn((a: MyAttachment): void => void seen.push(a.uploadId));
    const { rerender } = render(<Transcript<never, MyTurn, ChatVersion, MyAttachment> turns={mk()} onAttachmentClick={onAttachmentClick} />);
    await userEvent.click(screen.getByRole('button', { name: 'notes.md' }));
    expect(onAttachmentClick.mock.calls[0][0]).toBe(attachment);
    expect(seen).toEqual(['up-1']);
    rerender(<Transcript<never, MyTurn, ChatVersion, MyAttachment> turns={mk()} />);
    expect(screen.queryByRole('button', { name: 'notes.md' })).toBeNull();
  });

  it('attachmentVariant="card": sent files are read-only cards (status line, no remove button) that still call onAttachmentClick', async () => {
    const failed: MyAttachment = { type: 'attachment', kind: 'file', id: 'att-2', name: 'scan.pdf', uploadId: 'up-2', status: 'failed' };
    const turns = mk();
    turns[0].user.parts = [attachment, failed, ...turns[0].user.parts.slice(1)];
    const onAttachmentClick = vi.fn();
    render(<Transcript<never, MyTurn, ChatVersion, MyAttachment> turns={turns} attachmentVariant="card" onAttachmentClick={onAttachmentClick} />);
    expect(document.querySelectorAll('[data-slot="attachment"][data-variant="card"]')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: /^Remove/ })).toBeNull();
    expect(screen.getByText('Not sent')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /scan\.pdf/ }));
    expect(onAttachmentClick.mock.calls[0][0]).toBe(failed);
  });

  it('onCopyUser gets the same turn', async () => {
    const turns = mk();
    const onCopyUser = vi.fn();
    render(<Transcript<never, MyTurn> turns={turns} copyIcon={<Copy />} onCopyUser={onCopyUser} />);
    await userEvent.click(within(document.querySelector('[data-turn-id="u2"]') as HTMLElement).getByRole('button', { name: 'Copy' }));
    expect(onCopyUser.mock.calls[0][0]).toBe(turns[1]);
  });

  it('slots and renderTurn receive the same turn object', () => {
    const turns = mk();
    const seen: ConversationTurn[] = [];
    render(<Transcript<never, MyTurn> turns={turns} slots={{ timeline: (turn) => (seen.push(turn), null) }} renderTurn={(turn) => (turn.id === 'u2' ? (seen.push(turn), <p>{turn.threadRef}</p>) : undefined)} />);
    expect(seen).toContain(turns[0]);
    expect(seen).toContain(turns[1]);
    expect(screen.getByText('t-2')).toBeInTheDocument();
  });

  it('onAtEndChange fires when the scrolling ancestor moves to or from the end, on change only', () => {
    const onAtEndChange = vi.fn();
    const Wrap = () => (
      <div data-testid="box" style={{ overflowY: 'auto', height: 100 }}>
        <Transcript turns={failedTurns()} onAtEndChange={onAtEndChange} />
      </div>
    );
    render(<Wrap />);
    const box = screen.getByTestId('box');
    const set = (top: number) => {
      Object.defineProperty(box, 'scrollHeight', { configurable: true, value: 1000 });
      Object.defineProperty(box, 'clientHeight', { configurable: true, value: 100 });
      Object.defineProperty(box, 'scrollTop', { configurable: true, value: top });
      act(() => {
        box.dispatchEvent(new Event('scroll'));
      });
    };
    // The first measurement reports the starting state (an empty box is at its end).
    expect(onAtEndChange).toHaveBeenCalledTimes(1);
    expect(onAtEndChange).toHaveBeenLastCalledWith(true);
    set(0);
    expect(onAtEndChange).toHaveBeenLastCalledWith(false);
    set(10);
    expect(onAtEndChange).toHaveBeenCalledTimes(2);
    set(850);
    expect(onAtEndChange).toHaveBeenLastCalledWith(true);
    expect(onAtEndChange).toHaveBeenCalledTimes(3);
  });
});
