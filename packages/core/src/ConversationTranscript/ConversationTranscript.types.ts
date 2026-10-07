import * as React from 'react';

import type { ApprovalDecision, ApprovalIcons, ApprovalItem, ApprovalLabels, ApprovalStatus } from '../ApprovalCard';
import type { FeedbackPanelLabels, FeedbackReason, FeedbackSubmission } from '../FeedbackPanel';
import type { HighlightFn } from '../Highlight';
import type { MarkdownLabels } from '../Markdown';
import type { MessageActionsProps } from '../MessageActions';
import type { SourcesLabels } from '../Sources';
import type { StepTimelineLabels } from '../StepTimeline';
import type { SummaryDividerLabels } from '../SummaryDivider';
import type { ThinkingLabels } from '../Thinking';
import type { VersionPagerLabels } from '../VersionPager';
import type {
  ChatAttachmentPart,
  ChatSource,
  ChatVersion,
  ConversationStep,
  ConversationTurn,
  TranscriptConversationProps,
  TranscriptLabels,
} from '../Transcript';

/** A thumbs choice on a reply; `null` is "cleared". */
export type ConversationRating = 'up' | 'down' | null;

/** The source a citation pill or a source chip opened: the turn it belongs to and its number. `null`: none open. */
export type ConversationOpenSource = { turnId: string; n: number } | null;

/** A decision the assistant is waiting for (or that was taken) in a turn. Extend `approval` with your own fields. */
export interface ConversationApproval<P extends ApprovalItem = ApprovalItem> {
  /** The turn the approval belongs to (`turn.id`). */
  turnId: string;
  approval: P;
  /** `pending` is drawn after the reply, a decided one before it. Default `pending`. */
  status?: ApprovalStatus;
}

/** A summary that stands for the messages up to (and including) a turn: the divider is drawn after that turn. */
export interface ConversationSummary {
  /** The turn the divider follows (`turn.id`). */
  turnId: string;
  /** Messages the summary stands for. */
  count: number;
  text?: React.ReactNode;
}

/** Every icon of the parts the wrapper composes, as nodes (the library ships none). Copy, edit and stopped icons are the Transcript's own props. */
export interface ConversationTranscriptIcons {
  regenerate?: React.ReactNode;
  thumbsUp?: React.ReactNode;
  thumbsDown?: React.ReactNode;
  /** Icon of every step in the timeline. */
  step?: React.ReactNode;
  stepDone?: React.ReactNode;
  stepFailed?: React.ReactNode;
  spinner?: React.ReactNode;
  chevron?: React.ReactNode;
  thinking?: React.ReactNode;
  source?: React.ReactNode;
  sourceClose?: React.ReactNode;
  suggestion?: React.ReactNode;
  previous?: React.ReactNode;
  next?: React.ReactNode;
  summary?: React.ReactNode;
  retry?: React.ReactNode;
  approval?: ApprovalIcons;
}

/** Strings of the wrapper itself. */
export interface ConversationTranscriptLabels {
  /** Name of the reply's copy button. Default `Copy`. */
  copy: string;
  /** Name of the copy button while `copiedMs` has not passed. Default `Copied`. */
  copied: string;
  regenerate: string;
  goodReply: string;
  badReply: string;
}

export const DEFAULT_CONVERSATION_TRANSCRIPT_LABELS: ConversationTranscriptLabels = {
  copy: 'Copy',
  copied: 'Copied',
  regenerate: 'Regenerate',
  goodReply: 'Good reply',
  badReply: 'Bad reply',
};

/** Strings of the composed parts, each part's own label set. */
export interface ConversationTranscriptPartLabels {
  markdown?: Partial<MarkdownLabels>;
  sources?: Partial<SourcesLabels>;
  thinking?: Partial<ThinkingLabels>;
  steps?: Partial<StepTimelineLabels>;
  approval?: Partial<ApprovalLabels>;
  feedback?: Partial<FeedbackPanelLabels>;
  summary?: Partial<SummaryDividerLabels>;
  versions?: Partial<VersionPagerLabels>;
  /** Accessible name of the reply's action row. */
  actions?: string;
  /** Accessible name of the follow-up list. */
  suggestions?: string;
}

/**
 * Props of the ConversationTranscript. `U` is your turn type, `V` your version, `A` your attachment part, `S` your source,
 * `P` your approval item and `R` your feedback reason: every callback gets the SAME object you passed in (by reference).
 * Everything of the Transcript's conversation mode is accepted as is (`turns`, `busy`, `live`, edit callbacks, ...), except
 * `slots` and `renderMarkdown`, which this component fills.
 */
export interface ConversationTranscriptProps<
  U extends ConversationTurn = ConversationTurn,
  V extends ChatVersion = ChatVersion,
  A extends ChatAttachmentPart = ChatAttachmentPart,
  S extends ChatSource = ChatSource,
  P extends ApprovalItem = ApprovalItem,
  R extends FeedbackReason = FeedbackReason,
> extends
    Omit<TranscriptConversationProps<U, V, A>, 'slots' | 'renderMarkdown' | 'labels'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onCopy'> {
  icons?: ConversationTranscriptIcons;
  /** Icon node of the copy buttons (the question's and the reply's). */
  copyIcon?: React.ReactNode;
  /** Icon node of the reply's copy button right after it was chosen. Default: `copyIcon`. */
  copiedIcon?: React.ReactNode;
  labels?: Partial<ConversationTranscriptLabels>;
  /** The Transcript's own strings (stopped, edit, retry, ...). */
  transcriptLabels?: Partial<TranscriptLabels>;
  partLabels?: ConversationTranscriptPartLabels;
  /** Syntax highlighting of code blocks, e.g. the library's `highlightLines`. */
  highlight?: HighlightFn;
  codeLineNumbers?: boolean;
  wrapCode?: boolean;
  /** How long the copied state shows after a copy control is chosen, in ms. Default 1500. */
  copiedMs?: number;

  /** The label of a step in the timeline. Default: `step.name`. */
  stepLabel?: (step: ConversationStep) => React.ReactNode;
  /** The detail line of a done step. Default: none. */
  stepDetail?: (step: ConversationStep) => React.ReactNode;
  /** The steps timeline was opened or closed. Payload: the full turn and the new state. */
  onToggleSteps?: (turn: U, open: boolean) => void;
  /** The reasoning disclosure was opened or closed. Payload: the full turn and the new state. */
  onToggleThinking?: (turn: U, open: boolean) => void;

  /** A citation pill was chosen (pills are drawn only with this). The source opens in the Sources row. Payload: the full source (from `answer.sources`) and its turn. */
  onCite?: (source: S, turn: U) => void | Promise<void>;
  /** A code block's copy control was chosen (the control is drawn only with this). The caller writes the clipboard. Payload: the code, its language and the turn. */
  onCopyCode?: (code: string, language: string | undefined, turn: U) => void | Promise<void>;
  /** The open source (a pill or a chip opens it). Controlled when set. */
  openSource?: ConversationOpenSource;
  defaultOpenSource?: ConversationOpenSource;
  onOpenSourceChange?: (next: ConversationOpenSource) => void;
  /** A source chip was opened or closed. Payload: the full source, the new state and the turn. */
  onToggleSource?: (source: S, open: boolean, turn: U) => void;
  /** A follow-up was chosen. Payload: the suggestion (the string from `answer.suggestions`) and the turn. Absent: not drawn. */
  onSelectSuggestion?: (suggestion: string, turn: U) => void | Promise<void>;

  /** The reply's copy button was chosen (drawn only with this and `copyIcon`). The caller writes the clipboard. Payload: the full turn. */
  onCopyReply?: (turn: U) => void | Promise<void>;
  /** A thumb was chosen (the thumbs are drawn only with this). Payload: the full turn and the rating (`null` when cleared). */
  onRate?: (turn: U, rating: ConversationRating) => void | Promise<void>;
  /** Ratings by turn id. Controlled when set. */
  ratings?: Record<string, ConversationRating>;
  defaultRatings?: Record<string, ConversationRating>;
  /** Reasons for the panel that opens on a thumbs down. The panel is drawn only with this and `onSubmitFeedback`. */
  feedbackReasons?: R[];
  /** The feedback panel was submitted. Payload: the full turn and the submission (its `reasons` are your items). */
  onSubmitFeedback?: (turn: U, feedback: FeedbackSubmission<R>) => void | Promise<void>;
  /** The feedback panel was cancelled. Payload: the full turn. */
  onCancelFeedback?: (turn: U) => void | Promise<void>;
  /** Text next to the action row, e.g. the model and token count. */
  actionsMeta?: (turn: U) => React.ReactNode;

  /** Approvals by turn. Pending ones follow the reply, decided ones come before it. */
  approvals?: ConversationApproval<P>[];
  /** An approval was decided (the buttons are drawn only with this). Payload: the full approval item, the decision and the turn. */
  onDecideApproval?: (approval: P, decision: ApprovalDecision, turn: U) => void | Promise<void>;

  /** Summary dividers, each after its turn. */
  summaries?: ConversationSummary[];
  /** A summary disclosure was opened or closed. Payload: the full summary and the new state. */
  onToggleSummary?: (summary: ConversationSummary, open: boolean) => void;

  /** Extra actions appended to the reply's action row. */
  extraActions?: (turn: U) => MessageActionsProps['actions'];
}
