import * as React from 'react';

import { cn } from 'lib/utils';
import { AttachmentStrip } from '../Attachment';
import { VersionPager } from '../VersionPager';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { useControllableState } from '../lib/use-controllable-state';
import { DEFAULT_TRANSCRIPT_LABELS, type ChatAttachmentPart, type ChatVersion, type ConversationTurn, type TranscriptConversationProps, type TranscriptLabels, type TurnContext, type TurnSlot } from './Transcript.conversation.types';
import { promptOf } from './Transcript.turns';
import {
  conversationReplyClasses,
  conversationColumnClasses,
  conversationCursorClasses,
  conversationEditorClasses,
  conversationEditorTextareaClasses,
  conversationStoppedClasses,
  conversationTurnClasses,
  conversationUserActionsClasses,
  conversationUserClasses,
  transcriptBubbleVariants,
} from './Transcript.variants';

export interface TranscriptEditorProps {
  /** The text (controlled). */
  value: string;
  onChange: (next: string) => void;
  /** Send the text as a new version. Called only when the text is not empty and the editor is not `busy`. */
  onSubmit?: (value: string) => void | Promise<void>;
  /** Cancel button and Escape. Absent: no Cancel button and Escape does nothing. */
  onCancel?: () => void | Promise<void>;
  /** Shown on the line before Cancel and Send. */
  hint?: React.ReactNode;
  /** Enter sends and Shift+Enter adds a newline (default true). */
  submitOnEnter?: boolean;
  /** A reply is running: Send is disabled. */
  busy?: boolean;
  rows?: number;
  labels?: Partial<Pick<TranscriptLabels, 'editMessage' | 'editHint' | 'cancel' | 'send'>>;
  className?: string;
}

/**
 * The inline edit-and-resend editor of a question: a 3-row textarea (focused with the caret at the end), a hint, Cancel and
 * Send. Enter sends (when `submitOnEnter`), Shift+Enter is a newline, Escape cancels; Send is disabled when the text is
 * empty or `busy`. Ported from the original `UserMessage` edit mode. Slot: `data-slot="transcript-editor"`.
 *
 * @example
 * <TranscriptEditor value={text} onChange={setText} onSubmit={resend} onCancel={() => setEditing(null)} />
 */
export function TranscriptEditor({ value, onChange, onSubmit, onCancel, hint, submitOnEnter = true, busy = false, rows = 3, labels: labelsProp, className }: TranscriptEditorProps) {
  const labels = { ...DEFAULT_TRANSCRIPT_LABELS, ...labelsProp };
  const area = React.useRef<HTMLTextAreaElement>(null);
  React.useEffect(() => {
    const element = area.current;
    if (!element) return;
    element.focus();
    element.setSelectionRange(element.value.length, element.value.length);
    // Focus once, when the editor opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const canSend = value.trim().length > 0 && !busy && Boolean(onSubmit);
  return (
    <div data-slot="transcript-editor" className={cn(conversationEditorClasses, className)}>
      <textarea
        ref={area}
        aria-label={labels.editMessage}
        rows={rows}
        value={value}
        className={conversationEditorTextareaClasses}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            if (!onCancel) return;
            event.preventDefault();
            void onCancel();
          } else if (event.key === 'Enter' && !event.shiftKey && submitOnEnter && !event.nativeEvent.isComposing) {
            event.preventDefault();
            if (canSend) void onSubmit?.(value);
          }
        }}
      />
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 text-xs text-[color:var(--oui-panel-meta-fg)]">{hint ?? labels.editHint}</span>
        {onCancel ? (
          <Button type="button" variant="outline" buttonSize="sm" onClick={() => void onCancel()}>
            {labels.cancel}
          </Button>
        ) : null}
        {onSubmit ? (
          <Button type="button" tone="accent" buttonSize="sm" disabled={!canSend} onClick={() => void onSubmit(value)}>
            {labels.send}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

type ConversationProps<U extends ConversationTurn, V extends ChatVersion, A extends ChatAttachmentPart> = TranscriptConversationProps<U, V, A> &
  Required<Pick<TranscriptConversationProps<U, V, A>, 'turns'>> & {
    copyIcon?: React.ReactNode;
    copyLabel?: string;
  };

/** Whether a slot draws only once its part is `ready`; the Transcript decides when, the caller supplies what. */
const call = <U extends ConversationTurn>(slot: TurnSlot<U> | undefined, turn: U, context: TurnContext) => (slot ? slot(turn, context) : null);

/**
 * The turn-oriented body of the Transcript (use it through `<Transcript turns={...} />`): the "Load earlier messages"
 * button, the empty slot, then per turn the question (attachment chips, bubble or editor, hover actions) and the
 * assistant's reply (timeline, thinking, content with the streaming caret, stopped banner, sources, actions,
 * follow-ups) with approvals and the error around it. The order and visibility rules are the original's (see
 * {@link TranscriptTurnSlots}); the parts themselves are slots, so this file owns no Markdown, timeline or feedback code.
 */
export function TranscriptConversation<U extends ConversationTurn = ConversationTurn, V extends ChatVersion = ChatVersion, A extends ChatAttachmentPart = ChatAttachmentPart>({
  turns,
  busy = false,
  waiting = false,
  live,
  hasEarlier,
  onLoadEarlier,
  loadingEarlier,
  empty,
  readOnly = false,
  renderTurn,
  renderMarkdown,
  cursor,
  slots = {},
  editingId: editingProp,
  defaultEditingId = null,
  editValue: editValueProp,
  onEditChange,
  onEditStart,
  onEditSubmit,
  onEditCancel,
  onRetry,
  onRegenerate,
  onSelectVersion,
  onAttachmentClick,
  submitOnEnter = true,
  onCopyUser,
  editIcon,
  stoppedIcon,
  attachmentIcons,
  copyIcon,
  copyLabel,
  labels: labelsProp,
}: ConversationProps<U, V, A>) {
  const labels = { ...DEFAULT_TRANSCRIPT_LABELS, ...labelsProp, ...(copyLabel ? { copy: copyLabel } : {}) };
  // Editing state is controlled when `editingId` / `editValue` are given and kept inside otherwise; onEditChange fires in both.
  const [editingId, setEditingId] = useControllableState<string | null>(editingProp, defaultEditingId);
  const [editValue, setEditValue] = useControllableState<string>(editValueProp, '', onEditChange);
  const root = React.useRef<HTMLDivElement>(null);
  const lastIndex = turns.length - 1;

  // [STATE] Focus goes back to the question's edit button when its editor closes.
  const wasEditing = React.useRef<string | null>(null);
  React.useEffect(() => {
    const previous = wasEditing.current;
    wasEditing.current = editingId;
    if (previous && !editingId) {
      const turn = Array.from(root.current?.querySelectorAll<HTMLElement>('[data-turn-id]') ?? []).find((element) => element.dataset.turnId === previous);
      turn?.querySelector<HTMLElement>('[data-slot="transcript-edit"]')?.focus();
    }
  }, [editingId]);

  const drawUser = (turn: U, context: TurnContext) => {
    const prompt = promptOf(turn.user);
    // The attachment parts themselves are the items (by reference), so extra fields reach `onAttachmentClick`.
    const chips = turn.user.parts.filter((part): part is ChatAttachmentPart & A => part.type === 'attachment');
    const siblings = turn.user.siblings ?? [];
    const editing = editingId === turn.id && !readOnly;
    const index = siblings.findIndex((version) => version.id === turn.user.id);
    const defaultPager =
      onSelectVersion && siblings.length > 1 ? (
        <VersionPager
          index={Math.max(0, index)}
          count={siblings.length}
          disabled={busy}
          onMove={(step) => {
            const target = siblings[Math.max(0, index) + step];
            if (target) void onSelectVersion(turn, target as V);
          }}
        />
      ) : null;
    const versions = readOnly ? null : (call(slots.versions, turn, context) ?? defaultPager);
    const canCopy = !readOnly && Boolean(onCopyUser) && copyIcon !== undefined && copyIcon !== null;
    const canEdit = !readOnly && Boolean(onEditStart || onEditSubmit) && !editing;
    const userActions = readOnly ? null : call(slots.userActions, turn, context);
    const hasActions = Boolean(versions) || canCopy || canEdit || Boolean(userActions);
    return (
      <div data-slot="transcript-user" className={conversationUserClasses}>
        {chips.length > 0 ? <AttachmentStrip items={chips} variant="chip" readOnly layout="wrap" className="justify-end" kindIcons={attachmentIcons} onClick={onAttachmentClick} /> : null}
        {editing ? (
          <TranscriptEditor
            value={editValue}
            onChange={setEditValue}
            onSubmit={
              onEditSubmit
                ? (text) => {
                    void onEditSubmit(turn, text);
                    setEditingId(null);
                  }
                : undefined
            }
            onCancel={() => {
              setEditingId(null);
              void onEditCancel?.(turn);
            }}
            submitOnEnter={submitOnEnter}
            busy={busy}
            labels={labels}
          />
        ) : (
          <div data-slot="transcript-message" className={transcriptBubbleVariants({ kind: 'message' })} style={{ maxWidth: '100%' }}>
            {prompt}
          </div>
        )}
        {hasActions ? (
          <div data-slot="transcript-user-actions" data-shown={siblings.length > 1 ? 'true' : undefined} className={conversationUserActionsClasses}>
            {versions}
            {canCopy ? (
              <IconButton
                variant="ghost"
                iconSize="sm"
                icon={copyIcon}
                label={labels.copy}
                data-slot="transcript-user-copy"
                className="size-6 rounded-md"
                onClick={() => void onCopyUser?.(turn)}
              />
            ) : null}
            {canEdit ? (
              <IconButton
                variant="ghost"
                iconSize="sm"
                icon={editIcon ?? <span aria-hidden="true">✎</span>}
                label={labels.edit}
                disabled={busy}
                data-slot="transcript-edit"
                className="size-6 rounded-md"
                onClick={() => {
                  setEditValue(prompt);
                  setEditingId(turn.id);
                  void onEditStart?.(turn);
                }}
              />
            ) : null}
            {userActions}
          </div>
        ) : null}
      </div>
    );
  };

  const drawReply = (turn: U, context: TurnContext) => {
    const { running, stopped, last, text } = context;
    const done = !running;
    const content = renderMarkdown ? (
      renderMarkdown(text, { ...context, streaming: running })
    ) : (
      <div data-slot="transcript-content" className="whitespace-pre-wrap">
        {text}
      </div>
    );
    return (
      <div data-slot="transcript-reply" data-status={running ? 'running' : stopped ? 'stopped' : 'done'} className={conversationReplyClasses}>
        {call(slots.timeline, turn, context)}
        {call(slots.thinking, turn, context)}
        {text || running ? (
          <div data-slot="transcript-body" className="min-w-0">
            {content}
            {running ? (cursor ?? <span data-slot="transcript-cursor" aria-hidden="true" className={conversationCursorClasses} />) : null}
          </div>
        ) : null}
        {stopped ? (
          <div data-slot="transcript-stopped" className={conversationStoppedClasses}>
            {stoppedIcon ? <span aria-hidden="true" className="inline-flex">{stoppedIcon}</span> : null}
            {labels.stopped}
          </div>
        ) : null}
        {done && !readOnly ? call(slots.proposals, turn, context) : null}
        {done ? call(slots.sources, turn, context) : null}
        {(done || stopped) && !readOnly ? call(slots.actions, turn, context) : null}
        {done && !readOnly ? call(slots.feedback, turn, context) : null}
        {done && last && !busy && !readOnly ? call(slots.suggestions, turn, context) : null}
      </div>
    );
  };

  const drawTurn = (turn: U, index: number) => {
    const last = index === lastIndex;
    const live_ = last && live ? live : undefined;
    const isWaiting = last && waiting;
    const running = last && busy && !isWaiting;
    const failed = !turn.answer?.final && !running && (turn.run?.status === 'failed' || turn.run?.status === 'interrupted');
    const stopped = !running && turn.run?.status === 'cancelled';
    const context: TurnContext = {
      index,
      last,
      running,
      waiting: isWaiting,
      failed,
      stopped,
      text: live_?.text ?? turn.answer?.text ?? '',
      liveReasoning: live_?.reasoning,
      retry: onRetry ? () => void onRetry(turn) : undefined,
      regenerate: onRegenerate ? () => void onRegenerate(turn) : undefined,
      selectVersion: onSelectVersion ? (version) => void onSelectVersion(turn, version as V) : undefined,
    };
    const custom = renderTurn?.(turn, context);
    if (custom !== undefined) {
      return (
        <div key={turn.id} data-slot="transcript-turn" data-turn-id={turn.id} className={conversationTurnClasses}>
          {custom}
        </div>
      );
    }
    const showReply = Boolean(turn.answer || live_ || running || isWaiting) && !failed;
    return (
      <React.Fragment key={turn.id}>
        <div data-slot="transcript-turn" data-turn-id={turn.id} className={conversationTurnClasses}>
          {drawUser(turn, context)}
          {/* A decision comes before the reply it unblocked; a question still waiting for one is the last thing shown. */}
          {readOnly ? null : call(slots.approvalsBefore, turn, context)}
          {showReply ? drawReply(turn, context) : null}
          {readOnly ? null : call(slots.approvalsAfter, turn, context)}
          {failed && !readOnly
            ? (call(slots.error, turn, context) ?? (
                <div role="alert" data-slot="transcript-error" className="flex items-center gap-2 text-sm text-[color:var(--oui-tone-danger-fg)]">
                  <span className="min-w-0 flex-1">{turn.run?.error?.message ?? labels.failed}</span>
                  {onRetry ? (
                    <Button type="button" variant="outline" buttonSize="sm" data-slot="transcript-retry" onClick={() => void onRetry(turn)}>
                      {labels.retry}
                    </Button>
                  ) : null}
                </div>
              ))
            : null}
        </div>
        {index < lastIndex ? call(slots.summaryDivider, turn, context) : null}
      </React.Fragment>
    );
  };

  return (
    <div ref={root} className="contents">
      {hasEarlier && onLoadEarlier ? (
        <Button
          type="button"
          variant="outline"
          buttonSize="sm"
          className="self-center"
          disabled={loadingEarlier}
          data-slot="transcript-load-earlier"
          onClick={() => void onLoadEarlier(turns[0])}
        >
          {labels.loadEarlier}
        </Button>
      ) : null}
      {turns.length === 0 && !busy ? <div data-slot="transcript-empty">{empty}</div> : null}
      {turns.map(drawTurn)}
    </div>
  );
}

export { conversationColumnClasses };
