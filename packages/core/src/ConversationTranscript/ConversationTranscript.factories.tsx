import * as React from 'react';
import {
  Brain,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleStop,
  Copy,
  CornerDownRight,
  FileText,
  ListCollapse,
  Loader,
  Pencil,
  RefreshCw,
  Search,
  Shield,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react';

import { highlightLines } from '@oc-tech/omni-ui-components/Highlight';
import type { ApprovalItem } from '@oc-tech/omni-ui-components/ApprovalCard';
import type { ChatMessage, ChatVersion, ConversationStep, ConversationTurn } from '@oc-tech/omni-ui-components/Transcript';
import { SAMPLE_REPLY } from '../Markdown/Markdown.factories';
import { SAMPLE_REASONING } from '../Thinking/Thinking.factories';
import { sampleSources } from '../Sources/Sources.factories';
import { SAMPLE_REASONS } from '../FeedbackPanel/FeedbackPanel.factories';
import { ConversationTranscript } from './ConversationTranscript';
import type {
  ConversationApproval,
  ConversationTranscriptIcons,
  ConversationTranscriptProps,
  ConversationSummary,
} from './ConversationTranscript.types';

export type OnConversationTranscriptAction = (name: string, detail?: unknown) => void;

const at = (minute: number, second = 0) => new Date(Date.UTC(2026, 9, 6, 9, minute, second)).toISOString();

/** The lucide icons of the composed parts. */
export const conversationTranscriptIcons = (): ConversationTranscriptIcons => ({
  regenerate: <RefreshCw />,
  thumbsUp: <ThumbsUp />,
  thumbsDown: <ThumbsDown />,
  step: <Search />,
  stepDone: <Check />,
  stepFailed: <X />,
  spinner: <Loader />,
  chevron: <ChevronDown />,
  thinking: <Brain />,
  source: <FileText />,
  sourceClose: <X />,
  suggestion: <CornerDownRight />,
  previous: <ChevronLeft />,
  next: <ChevronRight />,
  summary: <ListCollapse />,
  approval: { badge: <Shield /> },
});

const sources = () => sampleSources().map((source) => ({ id: source.id, n: source.n, title: source.title, meta: source.meta, quote: source.quote }));

const steps = (): ConversationStep[] => [
  { id: 'a', name: 'searchEvidence', input: { query: 'two sum' }, output: { passages: 3 }, done: true, failed: false, group: 1 },
  { id: 'b', name: 'searchNotes', input: { query: 'two sum' }, output: { passages: 0 }, done: true, failed: false, group: 1 },
  { id: 'c', name: 'draftChange', input: {}, output: { ok: true }, done: true, failed: false, group: 2 },
];

const STEP_LABELS: Record<string, string> = { searchEvidence: 'Searched evidence', searchNotes: 'Searched notes', draftChange: 'Drafted a change' };
const STEP_DETAILS: Record<string, string> = { searchEvidence: '3 passages', searchNotes: 'No matching passages', draftChange: 'Waiting for your review' };

/** The reply of the `Markdown` showcase as turns: an earlier question, then the Two Sum question with its whole answer. */
export const chatReplyTurns = (): ConversationTurn[] => {
  const final: ChatMessage = {
    id: 'a-final',
    role: 'assistant',
    createdAt: at(1, 5),
    siblings: [{ id: 'a-final-0' }, { id: 'a-final' }, { id: 'a-final-2' }],
    parts: [{ type: 'text', text: SAMPLE_REPLY }],
  };
  return [
    {
      id: 'u0',
      user: { id: 'u0', role: 'user', createdAt: at(0), parts: [{ type: 'text', text: 'I want to practise array problems.' }] },
      answer: {
        first: { id: 'a0', role: 'assistant', createdAt: at(0, 3), parts: [{ type: 'text', text: 'Good: start with hash maps.' }] },
        final: { id: 'a0', role: 'assistant', createdAt: at(0, 3), parts: [{ type: 'text', text: 'Good: start with hash maps.' }] },
        text: 'Good: start with hash maps.',
        steps: [],
        sources: [],
        suggestions: [],
        partial: false,
        proposalIds: [],
      },
      run: { id: 'r0', userMessageId: 'u0', status: 'completed' },
    },
    {
      id: 'u1',
      user: { id: 'u1', role: 'user', createdAt: at(1), parts: [{ type: 'text', text: 'Give me a Two Sum solution.' }] },
      answer: {
        first: final,
        final,
        text: SAMPLE_REPLY,
        steps: steps(),
        reasoning: { text: SAMPLE_REASONING, seconds: 4 },
        sources: sources(),
        suggestions: ['Show me a test for it', 'What if the array is sorted?'],
        partial: false,
        proposalIds: [],
        seconds: 4.2,
        usage: { total: 842 },
      },
      run: { id: 'r1', userMessageId: 'u1', status: 'completed' },
    },
  ];
};

/** The same reply while it streams: running steps, the Thinking spinner, half the text and a cursor. */
export const streamingReplyTurns = (): ConversationTurn[] => {
  const [earlier, current] = chatReplyTurns();
  return [
    earlier!,
    {
      id: current!.id,
      user: current!.user,
      answer: undefined,
      run: { id: 'r1', userMessageId: 'u1', status: 'running' },
    },
  ];
};

export const chatReplyApproval = (): ConversationApproval => ({
  turnId: 'u1',
  approval: {
    id: 'approval-1',
    title: 'Save this solution to your notes?',
    description: 'The assistant wants to write to the Notes surface.',
    tool: 'writeNotes',
    tags: ['writeNotes', 'Notes'],
  },
});

export const chatReplySummary = (): ConversationSummary => ({
  turnId: 'u0',
  count: 6,
  text: 'You asked for a Two Sum solution and agreed on a hash map.',
});

/** Props that give the composition every icon and string it needs (callbacks are the caller's). */
export const conversationTranscriptPropsFactory = (overrides: Partial<ConversationTranscriptProps> = {}): ConversationTranscriptProps => ({
  turns: chatReplyTurns(),
  icons: conversationTranscriptIcons(),
  copyIcon: <Copy />,
  copiedIcon: <Check />,
  editIcon: <Pencil />,
  stoppedIcon: <CircleStop />,
  highlight: highlightLines,
  stepLabel: (step) => STEP_LABELS[step.name] ?? step.name,
  stepDetail: (step) => STEP_DETAILS[step.name],
  summaries: [chatReplySummary()],
  actionsMeta: () => 'Claude · 842 tokens',
  ...overrides,
});

export interface ConversationTranscriptDemoProps {
  phase?: 'done' | 'streaming';
  onAction?: OnConversationTranscriptAction;
}

/**
 * The `markdown--chat-reply` reply with no composition code: the data goes in, the callbacks report out. State that belongs to
 * the caller (the approval decision, the chosen answer version) lives here.
 */
export const ConversationTranscriptDemo: React.FC<ConversationTranscriptDemoProps> = ({ phase = 'done', onAction }) => {
  const streaming = phase === 'streaming';
  const [approval, setApproval] = React.useState<ConversationApproval<ApprovalItem>>(chatReplyApproval());
  const [versionId, setVersionId] = React.useState('a-final');
  const turns = React.useMemo(() => {
    const base = streaming ? streamingReplyTurns() : chatReplyTurns();
    return base.map((turn) => {
      const final = turn.answer?.final;
      return final?.siblings && final.siblings.length > 1 ? { ...turn, answer: { ...turn.answer!, final: { ...final, id: versionId } } } : turn;
    });
  }, [streaming, versionId]);
  return (
    <div className="max-w-[680px] rounded-xl border border-solid border-[color:var(--oui-panel-border)] bg-[color:var(--oui-panel-bg)] p-4 text-[color:var(--oui-tone-neutral-fg)]">
      <ConversationTranscript
        {...conversationTranscriptPropsFactory({ turns })}
        busy={streaming}
        live={streaming ? { text: SAMPLE_REPLY.slice(0, SAMPLE_REPLY.indexOf('return null;') + 4), reasoning: SAMPLE_REASONING } : undefined}
        approvals={streaming ? [] : [approval]}
        onDecideApproval={(item, decision) => {
          onAction?.('approval', decision);
          setApproval({ turnId: 'u1', approval: item, status: decision === 'deny' ? 'denied' : decision });
        }}
        onCite={(source) => onAction?.('cite', source.n)}
        onCopyCode={(code) => {
          onAction?.('copy', code);
          void navigator.clipboard?.writeText(code)?.catch(() => undefined);
        }}
        onCopyReply={(turn) => onAction?.('copy-reply', turn.id)}
        onRegenerate={(turn) => onAction?.('regenerate', turn.id)}
        onSelectVersion={(turn, version: ChatVersion) => {
          onAction?.('select-version', version.id);
          if (turn.id === 'u1') setVersionId(version.id);
        }}
        onRate={(turn, rating) => onAction?.('rate', { turn: turn.id, rating })}
        feedbackReasons={SAMPLE_REASONS}
        onSubmitFeedback={(turn, feedback) => onAction?.('feedback', { turn: turn.id, reasons: feedback.reasons.map((reason) => reason.id) })}
        onSelectSuggestion={(suggestion) => onAction?.('follow-up', suggestion)}
      />
    </div>
  );
};
