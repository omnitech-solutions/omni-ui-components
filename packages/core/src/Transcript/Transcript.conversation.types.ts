import * as React from 'react';

import type { AttachmentKind } from '../Attachment';

/** A piece of a source the model cited. Structural, so any `Sources` item type fits. */
export interface ChatSource {
  n: number;
  id: string;
  title: string;
  meta?: string;
  quote: string;
}

/** An attachment on a question: plain data, and a valid `AttachmentItem`, so extra fields flow through by reference. */
export interface ChatAttachmentPart {
  type: 'attachment';
  kind: AttachmentKind;
  id: string;
  name: string;
  meta?: string;
  previewUrl?: string;
}

/** One version of a message (an edit of a question, a regeneration of an answer). Extend it with your own fields. */
export interface ChatVersion {
  id: string;
}

export type ChatPart =
  | { type: 'text'; text: string }
  | { type: 'tool-call'; id: string; name: string; input?: unknown }
  | { type: 'tool-result'; id: string; output?: unknown }
  | { type: 'usage'; usage: unknown }
  /** `seconds` is how long the model thought: what "Thought for 4s" is built from. */
  | { type: 'reasoning'; text: string; seconds?: number }
  | ChatAttachmentPart
  | { type: 'sources'; items: ChatSource[] }
  | { type: 'suggestions'; items: string[] };

/** One message as the conversation view reads it (plain data: no server types). */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  parts: ChatPart[];
  /** ISO timestamp; `answer.seconds` is the difference between a question and its answer. */
  createdAt: string;
  /** `partial`: the reply was cut short. */
  status?: 'complete' | 'partial';
  /** Every version of this message in creation order (edits for a question, regenerations for an answer), as items so `onSelectVersion` hands one back by reference. */
  siblings?: ChatVersion[];
}

export type ChatRunStatus = 'queued' | 'running' | 'waiting' | 'completed' | 'failed' | 'cancelled' | 'interrupted';

export interface ChatRun {
  id: string;
  status: ChatRunStatus;
  userMessageId?: string;
  error?: { code: string; message: string };
}

/** A tool call and what came back. Calls made together in one step share a `group` and ran in parallel. */
export interface ConversationStep {
  id: string;
  name: string;
  input: unknown;
  output?: unknown;
  done: boolean;
  failed: boolean;
  group: number;
}

export interface ConversationAnswer {
  /** The first assistant message of this answer; its siblings are the other versions. */
  first: ChatMessage;
  /** The finished reply, when there is one. */
  final?: ChatMessage;
  text: string;
  steps: ConversationStep[];
  reasoning?: { text: string; seconds: number };
  sources: ChatSource[];
  suggestions: string[];
  usage?: unknown;
  partial: boolean;
  proposalIds: string[];
  /** Seconds from the question to the final message. */
  seconds?: number;
}

/** A question and everything the assistant did to answer it. `id` is the user message id. */
export interface ConversationTurn {
  id: string;
  user: ChatMessage;
  answer?: ConversationAnswer;
  run?: ChatRun;
}

/** What a slot or `renderTurn` knows about the turn it draws. */
export interface TurnContext {
  index: number;
  /** The newest turn: the only one that can stream, wait or offer follow-ups. */
  last: boolean;
  /** `last && busy && !waiting`. */
  running: boolean;
  /** `last && waiting`: held for an approval. */
  waiting: boolean;
  /** No final answer, not running, and the run failed or was interrupted. */
  failed: boolean;
  /** Not running and the run was cancelled. */
  stopped: boolean;
  /** The text being drawn: the live text on the running turn, otherwise the answer text. */
  text: string;
  /** Fires `onRetry(turn)` for this turn. Present only when `onRetry` is set: use it for an ErrorCard's Retry. */
  retry?: () => void;
  /** Fires `onRegenerate(turn)`. Present only when `onRegenerate` is set. */
  regenerate?: () => void;
  /** Fires `onSelectVersion(turn, version)`. Present only when `onSelectVersion` is set. */
  selectVersion?: (version: ChatVersion) => void;
  /** Live reasoning text of the running turn. */
  liveReasoning?: string;
}

export type TurnSlot<U extends ConversationTurn = ConversationTurn> = (turn: U, context: TurnContext) => React.ReactNode;

/**
 * Where the parts built elsewhere (Markdown, Thinking, StepTimeline, Sources, Suggestions, MessageActions, FeedbackPanel,
 * ApprovalCard, ErrorCard, VersionPager, SummaryDivider) plug into a turn. Each slot is a function of the turn and its
 * context; the Transcript decides WHEN it is drawn (sources, actions and follow-ups only once the reply is done;
 * follow-ups only on the last turn while nothing runs) and what order they come in:
 * user: `versions`, `userActions`; then `approvalsBefore` (decided); assistant: `timeline`, `thinking`, content, stopped
 * banner, `sources`, `proposals`, `actions`, `feedback`, `suggestions`; then `approvalsAfter` (pending), `error`;
 * and `summaryDivider` after the turn.
 */
export interface TranscriptTurnSlots<U extends ConversationTurn = ConversationTurn> {
  versions?: TurnSlot<U>;
  userActions?: TurnSlot<U>;
  approvalsBefore?: TurnSlot<U>;
  timeline?: TurnSlot<U>;
  thinking?: TurnSlot<U>;
  sources?: TurnSlot<U>;
  proposals?: TurnSlot<U>;
  actions?: TurnSlot<U>;
  feedback?: TurnSlot<U>;
  suggestions?: TurnSlot<U>;
  approvalsAfter?: TurnSlot<U>;
  error?: TurnSlot<U>;
  /** Drawn after the turn that holds the last summarised message. */
  summaryDivider?: TurnSlot<U>;
}

/** Every user-visible string of the conversation view. */
export interface TranscriptLabels {
  /** Accessible name of the log in conversation mode. Default `Conversation`. */
  conversation: string;
  loadEarlier: string;
  /** Shown on a stopped reply. Default `Stopped. Nothing has been applied.` */
  stopped: string;
  /** Name of the edit textarea. Default `Edit message`. */
  editMessage: string;
  /** Hint line of the editor. Default `Sends as a new branch — the original is kept.` */
  editHint: string;
  cancel: string;
  send: string;
  /** Name of the user bubble's edit button. Default `Edit and resend`. */
  edit: string;
  /** Name of the user bubble's copy button. Default `Copy`. */
  copy: string;
  /** Default error text when a failed run has no `error.message`. */
  failed: string;
  /** Name of the default error's Retry button. Default `Retry`. */
  retry: string;
  /** Accessible name of the question's version pager. Default `Versions`. */
  versions: string;
}

export const DEFAULT_TRANSCRIPT_LABELS: TranscriptLabels = {
  conversation: 'Conversation',
  loadEarlier: 'Load earlier messages',
  stopped: 'Stopped. Nothing has been applied.',
  editMessage: 'Edit message',
  editHint: 'Sends as a new branch — the original is kept.',
  cancel: 'Cancel',
  send: 'Send',
  edit: 'Edit and resend',
  copy: 'Copy',
  failed: 'The reply didn’t finish',
  retry: 'Retry',
  versions: 'Versions',
};

/**
 * The conversation (turn-oriented) props of the Transcript. They apply when `turns` is set. `U` is your turn type, `V` your
 * version type and `A` your attachment part type: every callback and slot gets the SAME object back (never a copy), so
 * extra fields you add are visible there.
 */
export interface TranscriptConversationProps<U extends ConversationTurn = ConversationTurn, V extends ChatVersion = ChatVersion, A extends ChatAttachmentPart = ChatAttachmentPart> {
  /** Turns from {@link buildTurns} (or your own): switches the Transcript to conversation mode. */
  turns?: U[];
  /** A reply is running (submitting, queued, running or waiting). The newest turn then streams. */
  busy?: boolean;
  /** The run waits for an approval: the newest turn is not `running`. */
  waiting?: boolean;
  /** Live text and reasoning of the reply being streamed (shown on the newest turn only). */
  live?: { text?: string; reasoning?: string };
  /** There are older messages to fetch: shows the `Load earlier messages` button. */
  hasEarlier?: boolean;
  /** The `Load earlier messages` button was chosen. Payload: the oldest turn now shown (`turns[0]`, or `undefined`). Absent: no button. */
  onLoadEarlier?: (oldest: U | undefined) => void | Promise<void>;
  /** The earlier page is being fetched: the button is disabled. */
  loadingEarlier?: boolean;
  /**
   * Draw only the newest N turns of `turns` (a long history keeps a small DOM). `Load earlier messages` then first reveals
   * `windowStep` more of the turns already in memory, keeping the scroll offset from the bottom so nothing jumps, and calls
   * `onLoadEarlier` only once every turn is shown and `hasEarlier` says more exist. Absent: every turn is drawn.
   */
  windowSize?: number;
  /** Turns revealed by each `Load earlier messages` while some are hidden. Default `windowSize`. */
  windowStep?: number;
  /** Shown when there are no turns and nothing runs: the empty state, or the "no longer shared" notice. */
  empty?: React.ReactNode;
  /** A shared, read-only transcript: no edit, copy, actions, versions, approvals or follow-ups; reading parts stay. */
  readOnly?: boolean;
  /** Replaces the whole drawing of a turn. Return `undefined` to fall back to the default. */
  renderTurn?: (turn: U, context: TurnContext) => React.ReactNode | undefined;
  /** Draws the answer text, e.g. the Markdown component: `(text) => <Markdown text={text} />`. Default: plain pre-wrapped text. */
  renderMarkdown?: (text: string, context: TurnContext & { streaming: boolean }) => React.ReactNode;
  /** The streaming caret node, drawn after the content while the turn runs. Default: a blinking bar (`data-slot="transcript-cursor"`). */
  cursor?: React.ReactNode;
  slots?: TranscriptTurnSlots<U>;
  /** Id of the turn whose question is being edited. Controlled when set; otherwise kept inside (see `defaultEditingId`). */
  editingId?: string | null;
  defaultEditingId?: string | null;
  /** The text in the editor. Controlled when set; otherwise kept inside. */
  editValue?: string;
  /** The editor text changed (fires in both modes). */
  onEditChange?: (next: string) => void;
  /** The edit button was chosen (the Transcript opens the editor itself when uncontrolled). Payload: the full turn. */
  onEditStart?: (turn: U) => void | Promise<void>;
  /**
   * Send the edited text as a new version (Send, or Enter). Payload: the full turn and the text. The editor closes itself
   * when uncontrolled. The edit button shows when this or `onEditStart` is set.
   */
  onEditSubmit?: (turn: U, text: string) => void | Promise<void>;
  /** Editing was cancelled (Cancel or Escape; the editor closes itself when uncontrolled). Payload: the full turn. */
  onEditCancel?: (turn: U) => void | Promise<void>;
  /** Retry a failed turn. Payload: the full turn. Adds a Retry button to the default error; also on `slots` context as `retry()`. */
  onRetry?: (turn: U) => void | Promise<void>;
  /** Regenerate a turn's answer. Payload: the full turn. Not drawn by the Transcript itself: wire `context.regenerate()` in `slots.actions`. */
  onRegenerate?: (turn: U) => void | Promise<void>;
  /** A version was chosen in the question's pager (shown when the question has `siblings` and this is set). Payload: the turn and the full version. */
  onSelectVersion?: (turn: U, version: V) => void | Promise<void>;
  /** An attachment chip on a question was chosen. Payload: the full attachment part (the same object from `user.parts`). Absent: chips are not buttons. */
  onAttachmentClick?: (attachment: A) => void | Promise<void>;
  /** The scroll container (the nearest scrolling ancestor, e.g. the Panel body) moved to or from the end. Payload: `true` when within `atEndThreshold` px of the end. Fires on change only, so a host can show its own jump pill. */
  onAtEndChange?: (atEnd: boolean) => void;
  /** Distance from the end that counts as at the end. Default 200, the original's follow distance. */
  atEndThreshold?: number;
  /** Enter sends in the editor, Shift+Enter adds a newline (default true). */
  submitOnEnter?: boolean;
  /** Show a copy button on the question: called with the turn (the caller writes the clipboard). Needs `copyIcon`. */
  onCopyUser?: (turn: U) => void | Promise<void>;
  /** Icon node of the edit button. */
  editIcon?: React.ReactNode;
  /** Icon node of the stopped banner. */
  stoppedIcon?: React.ReactNode;
  /** Icon nodes of attachment chips on a question, by kind. */
  attachmentIcons?: Partial<Record<AttachmentKind, React.ReactNode>>;
  /** Wider turns for a full-page view. Default 760 (px), the original column width. */
  maxWidth?: number | string;
  labels?: Partial<TranscriptLabels>;
}

/** The distance from the end within which the original keeps following new output. */
export const CONVERSATION_STICK_THRESHOLD = 200;
