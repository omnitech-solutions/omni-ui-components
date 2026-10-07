import '@testing-library/jest-dom';
import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import { Copy, Pencil } from 'lucide-react';

import { buildTurns, conversationScroll, Transcript, TranscriptEditor, type ChatMessage, type TranscriptProps } from '@oc-tech/omni-ui-components/Transcript';
import {
  answeredTurns,
  chatMessages,
  chatRuns,
  ConversationDemo,
  failedTurns,
  stoppedTurns,
  streamingTurns,
} from 'factories/omni-ui-components/Transcript/Transcript.factories';

const text = (id: string, role: ChatMessage['role'], body: string, at = '2026-10-06T09:00:00Z', extra: Partial<ChatMessage> = {}): ChatMessage => ({
  id,
  role,
  createdAt: at,
  parts: [{ type: 'text', text: body }],
  ...extra,
});

describe('omni-ui-components/Transcript buildTurns', () => {
  it('groups a question with the steps, final answer, reasoning, sources, suggestions and usage', () => {
    const [first, second] = buildTurns(chatMessages(), chatRuns());
    expect(first.id).toBe('u1');
    expect(first.run?.status).toBe('completed');
    const answer = first.answer!;
    expect(answer.steps).toEqual([{ id: 'call-1', name: 'searchEvidence', input: { query: 'two sum' }, output: { passages: 3 }, done: true, failed: false, group: 1 }]);
    expect(answer.final?.id).toBe('a2');
    expect(answer.text).toMatch(/hash map|map/i);
    expect(answer.reasoning).toEqual({ text: expect.any(String), seconds: 4 });
    expect(answer.sources).toHaveLength(1);
    expect(answer.suggestions).toHaveLength(2);
    expect(answer.usage).toEqual({ total: 1280 });
    expect(answer.seconds).toBe(9);
    expect(second.answer).toBeUndefined();
  });
  it('skips system messages and orphans, marks failed steps, parallel groups and proposals', () => {
    const call = (id: string, parts: ChatMessage['parts']): ChatMessage => ({ id, role: 'assistant', createdAt: '2026-10-06T09:00:01Z', parts });
    const turns = buildTurns([
      text('s', 'system', 'sys'),
      text('o', 'assistant', 'orphan'),
      text('u', 'user', 'go'),
      call('c', [
        { type: 'tool-call', id: '1', name: 'a' },
        { type: 'tool-call', id: '2', name: 'b' },
      ]),
      { id: 't', role: 'tool', createdAt: '2026-10-06T09:00:02Z', parts: [{ type: 'tool-result', id: '1', output: { error: 'x' } }, { type: 'tool-result', id: '2', output: { proposalId: 'p1' } }] },
      call('c2', [{ type: 'tool-call', id: '3', name: 'c' }]),
    ]);
    expect(turns).toHaveLength(1);
    const steps = turns[0].answer!.steps;
    expect(steps.map((s) => [s.group, s.failed, s.done])).toEqual([[1, true, true], [1, false, true], [2, false, false]]);
    expect(turns[0].answer!.proposalIds).toEqual(['p1']);
    expect(turns[0].answer!.final).toBeUndefined();
  });
  it('a partial message marks the answer partial; the latest run per question wins', () => {
    const turns = buildTurns([text('u', 'user', 'q'), text('a', 'assistant', 'half', undefined, { status: 'partial' })], [
      { id: 'r1', userMessageId: 'u', status: 'failed' },
      { id: 'r2', userMessageId: 'u', status: 'cancelled' },
    ]);
    expect(turns[0].answer!.partial).toBe(true);
    expect(turns[0].run?.id).toBe('r2');
  });
});

describe('omni-ui-components/Transcript conversation mode', () => {
  const base = (over: Partial<TranscriptProps> = {}): TranscriptProps => ({ turns: answeredTurns(), copyIcon: <Copy />, editIcon: <Pencil />, ...over });

  it('is a polite log named Conversation with a turn per question', () => {
    render(<Transcript {...base()} />);
    const log = screen.getByRole('log', { name: 'Conversation' });
    expect(log).toHaveAttribute('aria-live', 'polite');
    expect(log).toHaveStyle({ maxWidth: '760px' });
    expect(log.querySelectorAll('[data-slot="transcript-turn"]')).toHaveLength(2);
  });
  it('flat entries mode is unchanged (no live region)', () => {
    render(<Transcript entries={[{ id: 'a', kind: 'message', text: 'hi' }]} />);
    expect(screen.getByRole('log', { name: 'Transcript' })).not.toHaveAttribute('aria-live');
  });
  it('draws the question bubble with attachment chips and the reply text through renderMarkdown', () => {
    render(<Transcript {...base({ renderMarkdown: (value) => <b data-testid="md">{value.slice(0, 8)}</b> })} />);
    expect(screen.getByText('two-sum-notes.md')).toBeInTheDocument();
    expect(screen.getAllByTestId('md')).toHaveLength(2);
  });
  it('Load earlier shows with hasEarlier and calls back; disabled while loading', async () => {
    const onLoadEarlier = vi.fn();
    const { rerender } = render(<Transcript {...base({ hasEarlier: true, onLoadEarlier })} />);
    await userEvent.click(screen.getByRole('button', { name: 'Load previous messages' }));
    expect(onLoadEarlier).toHaveBeenCalled();
    rerender(<Transcript {...base({ hasEarlier: true, onLoadEarlier, loadingEarlier: true })} />);
    expect(screen.getByRole('button', { name: 'Load previous messages' })).toBeDisabled();
    rerender(<Transcript {...base({ hasEarlier: true })} />);
    expect(screen.queryByRole('button', { name: 'Load previous messages' })).toBeNull();
  });
  it('shows the empty slot only with no turns and nothing running', () => {
    const { rerender } = render(<Transcript turns={[]} empty={<p>nothing</p>} />);
    expect(screen.getByText('nothing')).toBeInTheDocument();
    rerender(<Transcript turns={[]} busy empty={<p>nothing</p>} />);
    expect(screen.queryByText('nothing')).toBeNull();
  });
  it('the last turn streams: live text, the caret, running status; earlier turns do not', () => {
    render(<Transcript {...base({ turns: streamingTurns(), busy: true, live: { text: 'live words' } })} />);
    expect(screen.getByText('live words')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-slot="transcript-cursor"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-status="running"]')).toHaveLength(1);
  });
  it('waiting for an approval is not running (no caret)', () => {
    render(<Transcript {...base({ turns: streamingTurns(), busy: true, waiting: true, live: { text: 'x' } })} />);
    expect(document.querySelector('[data-slot="transcript-cursor"]')).toBeNull();
  });
  it('a custom cursor node replaces the default', () => {
    render(<Transcript {...base({ turns: streamingTurns(), busy: true, live: { text: 'x' }, cursor: <i data-testid="c" /> })} />);
    expect(screen.getByTestId('c')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="transcript-cursor"]')).toBeNull();
  });
  it('stopped shows the banner; failed shows the error slot instead of the reply, or a default alert', () => {
    const { rerender } = render(<Transcript {...base({ turns: stoppedTurns() })} />);
    expect(screen.getByText('Stopped. Nothing has been applied.')).toBeInTheDocument();
    rerender(<Transcript {...base({ turns: failedTurns(), slots: { error: () => <div role="alert">custom error</div> } })} />);
    expect(screen.getByRole('alert')).toHaveTextContent('custom error');
    expect(document.querySelectorAll('[data-slot="transcript-reply"]')).toHaveLength(1);
    rerender(<Transcript {...base({ turns: failedTurns() })} />);
    expect(screen.getByRole('alert')).toHaveTextContent('The model did not answer in time.');
  });

  it('slot order and visibility: actions after the reply, follow-ups only on the last done turn, none while busy', () => {
    const slot = (name: string) => () => <span data-testid={name}>{name}</span>;
    const slots = { timeline: slot('timeline'), thinking: slot('thinking'), sources: slot('sources'), actions: slot('actions'), suggestions: slot('suggestions'), approvalsBefore: slot('before'), approvalsAfter: slot('after'), summaryDivider: slot('summary') };
    const { rerender } = render(<Transcript {...base({ slots })} />);
    // Two answered turns: the sources/actions slot runs per answered turn, suggestions only on the last.
    expect(screen.getAllByTestId('suggestions')).toHaveLength(1);
    expect(screen.getAllByTestId('before')).toHaveLength(2);
    expect(screen.getAllByTestId('summary')).toHaveLength(1);
    const first = document.querySelector('[data-turn-id="u1"]') as HTMLElement;
    const order = Array.from(first.querySelectorAll('[data-testid]')).map((el) => el.getAttribute('data-testid'));
    expect(order).toEqual(['before', 'timeline', 'thinking', 'sources', 'actions', 'after']);
    rerender(<Transcript {...base({ slots, busy: true, live: { text: 'x' }, turns: streamingTurns() })} />);
    expect(screen.queryByTestId('suggestions')).toBeNull();
    const last = document.querySelector('[data-turn-id="u2"]') as HTMLElement;
    expect(within(last).queryByTestId('actions')).toBeNull();
    expect(within(last).queryByTestId('sources')).toBeNull();
  });
  it('renderTurn replaces a whole turn, undefined falls back', () => {
    render(<Transcript {...base({ renderTurn: (turn) => (turn.id === 'u1' ? <p>custom turn</p> : undefined) })} />);
    expect(screen.getByText('custom turn')).toBeInTheDocument();
    expect(screen.getByText(/duplicates/)).toBeInTheDocument();
  });
  it('readOnly hides edit, copy, versions and interactive slots but keeps reading ones', () => {
    const slot = (name: string) => () => <span data-testid={name} />;
    render(<Transcript {...base({ readOnly: true, onEditStart: () => undefined, onCopyUser: () => undefined, slots: { actions: slot('actions'), versions: slot('versions'), error: slot('error'), timeline: slot('timeline') } })} />);
    expect(screen.queryByRole('button', { name: 'Edit and resend' })).toBeNull();
    expect(screen.queryByTestId('actions')).toBeNull();
    expect(screen.queryByTestId('versions')).toBeNull();
    expect(screen.getAllByTestId('timeline').length).toBeGreaterThan(0);
  });

  describe('edit and resend', () => {
    it('edit button needs onEditStart and is disabled while busy; copy button needs onCopyUser and copyIcon', async () => {
      const onEditStart = vi.fn();
      const onCopyUser = vi.fn();
      const { rerender } = render(<Transcript {...base({ onEditStart, onCopyUser })} />);
      const buttons = screen.getAllByRole('button', { name: 'Edit and resend' });
      await userEvent.click(buttons[1]);
      expect(onEditStart).toHaveBeenCalledWith(expect.objectContaining({ id: 'u2' }));
      await userEvent.click(screen.getAllByRole('button', { name: 'Copy' })[0]);
      expect(onCopyUser).toHaveBeenCalledWith(expect.objectContaining({ id: 'u1' }));
      rerender(<Transcript {...base({ onEditStart, busy: true })} />);
      expect(screen.getAllByRole('button', { name: 'Edit and resend' })[0]).toBeDisabled();
    });
    it('the editor: Enter sends, Shift+Enter newline, Esc cancels, Send disabled when empty or busy', async () => {
      const onSubmit = vi.fn();
      const onCancel = vi.fn();
      const Host: React.FC<{ busy?: boolean; submitOnEnter?: boolean }> = ({ busy, submitOnEnter }) => {
        const [value, setValue] = React.useState('abc');
        return <TranscriptEditor value={value} onChange={setValue} onSubmit={onSubmit} onCancel={onCancel} busy={busy} submitOnEnter={submitOnEnter} />;
      };
      const { rerender } = render(<Host />);
      const box = screen.getByRole('textbox', { name: 'Edit message' });
      expect(box).toHaveFocus();
      expect(screen.getByText('Sends as a new branch — the original is kept.')).toBeInTheDocument();
      await userEvent.type(box, '{Shift>}{Enter}{/Shift}d');
      expect(box).toHaveValue('abc\nd');
      await userEvent.keyboard('{Enter}');
      expect(onSubmit).toHaveBeenCalledWith('abc\nd');
      await userEvent.keyboard('{Escape}');
      expect(onCancel).toHaveBeenCalled();
      await userEvent.clear(box);
      expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
      rerender(<Host busy />);
      expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
    });
    it('submitOnEnter off: Enter does not send', async () => {
      const onSubmit = vi.fn();
      render(<TranscriptEditor value="x" onChange={() => undefined} onSubmit={onSubmit} onCancel={() => undefined} submitOnEnter={false} />);
      await userEvent.type(screen.getByRole('textbox'), '{Enter}');
      expect(onSubmit).not.toHaveBeenCalled();
    });
    it('Transcript swaps the bubble for the editor and returns focus to the edit button when it closes', async () => {
      const Host: React.FC = () => {
        const [editingId, setEditingId] = React.useState<string | null>(null);
        const [value, setValue] = React.useState('');
        return (
          <Transcript {...base({ editingId, editValue: value, onEditChange: setValue, onEditStart: (turn) => { setValue('draft'); setEditingId(turn.id); }, onEditCancel: () => setEditingId(null), onEditSubmit: () => setEditingId(null) })} />
        );
      };
      render(<Host />);
      const turn = () => document.querySelector('[data-turn-id="u2"]') as HTMLElement;
      const edit = within(turn()).getByRole('button', { name: 'Edit and resend' });
      await userEvent.click(edit);
      expect(within(turn()).getByRole('textbox', { name: 'Edit message' })).toHaveValue('draft');
      await userEvent.keyboard('{Escape}');
      expect(within(turn()).queryByRole('textbox')).toBeNull();
      expect(within(turn()).getByRole('button', { name: 'Edit and resend' })).toHaveFocus();
    });
  });

  it('editing is uncontrolled when editingId is not given: the edit button opens the editor, submit closes it, onEditChange fires', async () => {
    const onEditSubmit = vi.fn();
    const onEditChange = vi.fn();
    render(<Transcript {...base({ onEditSubmit, onEditChange })} />);
    await userEvent.click(within(document.querySelector('[data-turn-id="u2"]') as HTMLElement).getByRole('button', { name: 'Edit and resend' }));
    const box = screen.getByRole('textbox', { name: 'Edit message' });
    expect(box).toHaveValue('What changes if the array holds duplicates?');
    await userEvent.type(box, '!');
    expect(onEditChange).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onEditSubmit).toHaveBeenCalledWith(expect.objectContaining({ id: 'u2' }), 'What changes if the array holds duplicates?!');
    expect(screen.queryByRole('textbox', { name: 'Edit message' })).toBeNull();
  });
  it('without onEditStart or onEditSubmit there is no edit button; without onCopyUser no copy button', () => {
    render(<Transcript {...base()} />);
    expect(screen.queryByRole('button', { name: 'Edit and resend' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Copy' })).toBeNull();
  });
  it('conversationScroll maps turns to the Panel config', () => {
    expect(conversationScroll(answeredTurns(), 'live')).toMatchObject({ stickToBottom: true, lines: 2, activity: 'live' });
  });
  it('the whole demo renders in a Panel with the real parts in the slots', () => {
    render(<ConversationDemo />);
    expect(screen.getByRole('log', { name: 'Conversation' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Message' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Regenerate' }).length).toBeGreaterThan(0);
  });
});
