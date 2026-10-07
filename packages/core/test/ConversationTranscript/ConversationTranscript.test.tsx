import '@testing-library/jest-dom';
import type { ApprovalItem } from '@oc-tech/omni-ui-components/ApprovalCard';
import {
  ConversationTranscript,
  DEFAULT_CONVERSATION_TRANSCRIPT_LABELS,
} from '@oc-tech/omni-ui-components/ConversationTranscript';
import type { FeedbackReason } from '@oc-tech/omni-ui-components/FeedbackPanel';
import type {
  ChatSource,
  ChatVersion,
  ConversationTurn,
} from '@oc-tech/omni-ui-components/Transcript';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ConversationTranscriptDemo,
  chatReplyApproval,
  chatReplySummary,
  chatReplyTurns,
  conversationTranscriptPropsFactory,
} from 'factories/omni-ui-components/ConversationTranscript/ConversationTranscript.factories';
import type * as React from 'react';

interface MyTurn extends ConversationTurn {
  tag: string;
}
interface MySource extends ChatSource {
  score: number;
}
interface MyApproval extends ApprovalItem {
  risk: 'low' | 'high';
}
interface MyReason extends FeedbackReason {
  weight: number;
}
interface MyVersion extends ChatVersion {
  label: string;
}

const extendedTurns = (): MyTurn[] =>
  chatReplyTurns().map((turn) => ({
    ...turn,
    tag: `tag-${turn.id}`,
    answer: turn.answer && {
      ...turn.answer,
      sources: turn.answer.sources.map(
        (source, index) => ({ ...source, score: index }) as MySource,
      ),
    },
  }));

const setup = (props: Partial<React.ComponentProps<typeof ConversationTranscript>> = {}) =>
  render(<ConversationTranscript {...conversationTranscriptPropsFactory()} {...props} />);

/** The second turn: the first one has a short reply with its own actions. */
const reply = () => within(document.querySelector('[data-turn-id="u1"]') as HTMLElement);

describe('omni-ui-components/ConversationTranscript composition', () => {
  it('draws the whole reply from props only', () => {
    setup({
      onCopyReply: () => undefined,
      onRegenerate: () => undefined,
      onSelectVersion: () => undefined,
      onRate: () => undefined,
      onSelectSuggestion: () => undefined,
      onCite: () => undefined,
      approvals: [chatReplyApproval()],
      onDecideApproval: () => undefined,
    });
    expect(screen.getByRole('log')).toBeInTheDocument();
    expect(screen.getByText('Give me a Two Sum solution.')).toBeInTheDocument();
    expect(screen.getByText(/Thought for 4s/)).toBeInTheDocument();
    expect(screen.getByText('Two Sum')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Open source 1' }).length).toBeGreaterThan(0);
    for (const name of ['Copy', 'Regenerate', 'Good reply', 'Bad reply'])
      expect(screen.getAllByRole('button', { name }).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Show me a test for it' })).toBeInTheDocument();
    expect(screen.getByText('Save this solution to your notes?')).toBeInTheDocument();
    expect(screen.getByText(/earlier messages summarised/i)).toBeInTheDocument();
    expect(screen.getAllByText('Claude · 842 tokens')).toHaveLength(2);
  });

  it('draws nothing for a part whose callback is absent', () => {
    setup();
    expect(screen.queryByRole('button', { name: 'Regenerate' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Good reply' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Show me a test for it' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Open source 1' })).toBeNull();
    expect(screen.queryByRole('group', { name: /allow/i })).toBeNull();
  });

  it('takes every string from labels', () => {
    setup({ onRate: () => undefined, labels: { goodReply: 'Bon', badReply: 'Mauvais' } });
    expect(reply().getByRole('button', { name: 'Bon' })).toBeInTheDocument();
    expect(reply().getByRole('button', { name: 'Mauvais' })).toBeInTheDocument();
    expect(DEFAULT_CONVERSATION_TRANSCRIPT_LABELS.regenerate).toBe('Regenerate');
  });
});

describe('omni-ui-components/ConversationTranscript callbacks receive the original items', () => {
  it('onCite: the original source and turn; the source opens; onToggleSource follows with the same source', async () => {
    const turns = extendedTurns();
    const onCite = vi.fn();
    const onToggleSource = vi.fn();
    const onOpenSourceChange = vi.fn();
    setup({ turns, onCite, onToggleSource, onOpenSourceChange });
    await userEvent.click(screen.getAllByRole('button', { name: 'Open source 1' })[0]!);
    const source = turns[1]!.answer!.sources[0]!;
    expect(onCite.mock.calls[0]![0]).toBe(source);
    expect(onCite.mock.calls[0]![1]).toBe(turns[1]);
    expect(onOpenSourceChange).toHaveBeenCalledWith({ turnId: 'u1', n: 1 });
    expect(screen.getByRole('group', { name: 'Two Sum notes' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: /^1 Two Sum notes/ }));
    expect(onToggleSource).toHaveBeenCalled();
    expect(onToggleSource.mock.calls.at(-1)![0]).toBe(source);
    expect(onToggleSource.mock.calls.at(-1)![2]).toBe(turns[1]);
  });

  it('onSelectSuggestion: the suggestion string and the turn', async () => {
    const turns = extendedTurns();
    const onSelectSuggestion = vi.fn();
    setup({ turns, onSelectSuggestion });
    await userEvent.click(screen.getByRole('button', { name: 'What if the array is sorted?' }));
    expect(onSelectSuggestion.mock.calls[0]![0]).toBe(turns[1]!.answer!.suggestions[1]);
    expect(onSelectSuggestion.mock.calls[0]![1]).toBe(turns[1]);
  });

  it('onCopyReply, onRegenerate and onRate receive the turn; the copied state shows, thumbs toggle', async () => {
    const turns = extendedTurns();
    const onCopyReply = vi.fn();
    const onRegenerate = vi.fn();
    const onRate = vi.fn();
    setup({ turns, onCopyReply, onRegenerate, onRate, copiedMs: 50 });
    const row = reply().getByRole('toolbar');
    await userEvent.click(within(row).getByRole('button', { name: 'Copy' }));
    expect(onCopyReply.mock.calls[0]![0]).toBe(turns[1]);
    expect(within(row).getByRole('button', { name: 'Copied' })).toBeInTheDocument();
    await userEvent.click(within(row).getByRole('button', { name: 'Regenerate' }));
    expect(onRegenerate.mock.calls[0]![0]).toBe(turns[1]);
    await userEvent.click(within(row).getByRole('button', { name: 'Good reply' }));
    expect(onRate.mock.calls[0]![0]).toBe(turns[1]);
    expect(onRate.mock.calls[0]![1]).toBe('up');
    expect(within(row).getByRole('button', { name: 'Good reply' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await userEvent.click(within(row).getByRole('button', { name: 'Good reply' }));
    expect(onRate.mock.calls[1]![1]).toBeNull();
  });

  it('onSelectVersion from the reply pager: the turn and the original version item', async () => {
    const turns = extendedTurns();
    const versions = turns[1]!.answer!.final!.siblings as MyVersion[];
    const onSelectVersion = vi.fn();
    setup({ turns, onSelectVersion });
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(onSelectVersion.mock.calls[0]![0]).toBe(turns[1]);
    expect(onSelectVersion.mock.calls[0]![1]).toBe(versions[2]);
  });

  it('thumbs down opens the feedback panel; submit and cancel receive the turn and the original reasons', async () => {
    const turns = extendedTurns();
    const reasons: MyReason[] = [
      { id: 'a', label: 'Incorrect', weight: 1 },
      { id: 'b', label: 'Too long', weight: 2 },
    ];
    const onSubmitFeedback = vi.fn();
    const onCancelFeedback = vi.fn();
    const onRate = vi.fn();
    setup({ turns, onRate, feedbackReasons: reasons, onSubmitFeedback, onCancelFeedback });
    await userEvent.click(reply().getByRole('button', { name: 'Bad reply' }));
    const panel = screen.getByRole('group', { name: 'What went wrong?' });
    await userEvent.click(within(panel).getByRole('button', { name: 'Cancel' }));
    expect(onCancelFeedback.mock.calls[0]![0]).toBe(turns[1]);
    expect(screen.queryByRole('group', { name: 'What went wrong?' })).toBeNull();
    // Toggle off, then down again.
    await userEvent.click(reply().getByRole('button', { name: 'Bad reply' }));
    await userEvent.click(reply().getByRole('button', { name: 'Bad reply' }));
    const again = screen.getByRole('group', { name: 'What went wrong?' });
    await userEvent.click(within(again).getByText('Too long'));
    await userEvent.click(within(again).getByRole('button', { name: /send|submit/i }));
    expect(onSubmitFeedback.mock.calls[0]![0]).toBe(turns[1]);
    expect(onSubmitFeedback.mock.calls[0]![1].reasons[0]).toBe(reasons[1]);
  });

  it('onDecideApproval: the original approval item, the decision and the turn; a decided one moves before the reply', async () => {
    const turns = extendedTurns();
    const item: MyApproval = { id: 'x', title: 'Run it?', tool: 'run', risk: 'high' };
    const onDecideApproval = vi.fn();
    const { rerender } = setup({
      turns,
      approvals: [{ turnId: 'u1', approval: item }],
      onDecideApproval,
    });
    await userEvent.click(screen.getByRole('button', { name: /allow once/i }));
    expect(onDecideApproval.mock.calls[0]![0]).toBe(item);
    expect(onDecideApproval.mock.calls[0]![1]).toBe('once');
    expect(onDecideApproval.mock.calls[0]![2]).toBe(turns[1]);
    rerender(
      <ConversationTranscript
        {...conversationTranscriptPropsFactory({
          turns,
          approvals: [{ turnId: 'u1', approval: item, status: 'once' }],
        })}
      />,
    );
    const decided = screen.getByText('Run it?');
    const reply = document.querySelector('[data-turn-id="u1"] [data-slot="transcript-reply"]')!;
    expect(decided.compareDocumentPosition(reply) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('onToggleSteps, onToggleThinking and onToggleSummary report the turn or summary and the new state', async () => {
    const turns = extendedTurns();
    const summary = chatReplySummary();
    const onToggleSteps = vi.fn();
    const onToggleThinking = vi.fn();
    const onToggleSummary = vi.fn();
    setup({ turns, summaries: [summary], onToggleSteps, onToggleThinking, onToggleSummary });
    await userEvent.click(screen.getByRole('button', { name: /used 3 tools/i }));
    expect(onToggleSteps.mock.calls[0]![0]).toBe(turns[1]);
    expect(onToggleSteps.mock.calls[0]![1]).toBe(true);
    await userEvent.click(screen.getByRole('button', { name: /thought for/i }));
    expect(onToggleThinking.mock.calls[0]![0]).toBe(turns[1]);
    expect(onToggleThinking.mock.calls[0]![1]).toBe(true);
    await userEvent.click(screen.getByRole('button', { name: /earlier messages summarised/i }));
    expect(onToggleSummary.mock.calls[0]![0]).toBe(summary);
    expect(onToggleSummary.mock.calls[0]![1]).toBe(true);
  });

  it('onCopyCode: the code, its language and the turn', async () => {
    const turns = extendedTurns();
    const onCopyCode = vi.fn();
    setup({ turns, onCopyCode });
    await userEvent.click(reply().getByRole('button', { name: 'Copy' }));
    expect(onCopyCode.mock.calls[0]![0]).toContain('twoSum');
    expect(onCopyCode.mock.calls[0]![1]).toBe('ts');
    expect(onCopyCode.mock.calls[0]![2]).toBe(turns[1]);
  });

  it('onRetry on a failed turn: the error card calls it with the turn', async () => {
    const turns = extendedTurns();
    const failed: MyTurn = {
      ...turns[1]!,
      answer: undefined,
      run: {
        id: 'r',
        userMessageId: 'u1',
        status: 'failed',
        error: { code: 'x', message: 'Model down' },
      },
    };
    const onRetry = vi.fn();
    setup({ turns: [turns[0]!, failed], onRetry });
    expect(screen.getByText('Model down')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry.mock.calls[0]![0]).toBe(failed);
  });

  it('extra fields are visible to the callbacks (type-level) and the demo renders', () => {
    const turns = extendedTurns();
    render(
      <ConversationTranscript<MyTurn, MyVersion, never, MySource, MyApproval, MyReason>
        turns={turns}
        onCite={(source, turn) => {
          const score: number = source.score;
          const tag: string = turn.tag;
          return void [score, tag];
        }}
        onDecideApproval={(approval) => void approval.risk}
        onSubmitFeedback={(turn, feedback) => void [turn.tag, feedback.reasons[0]?.weight]}
        onSelectVersion={(turn, version) => void [turn.tag, version.label]}
      />,
    );
    expect(screen.getByRole('log')).toBeInTheDocument();
    const { container } = render(<ConversationTranscriptDemo />);
    expect(container.querySelector('[data-slot="transcript-reply"]')).not.toBeNull();
  });
});
