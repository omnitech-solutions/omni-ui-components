import * as React from 'react';
import { ApprovalCard, type ApprovalItem } from '../ApprovalCard';
import { ErrorCard } from '../ErrorCard';
import { FeedbackPanel, type FeedbackReason } from '../FeedbackPanel';
import { useControllableState } from '../lib/use-controllable-state';
import { Markdown } from '../Markdown';
import { type MessageAction, MessageActions } from '../MessageActions';
import { Sources } from '../Sources';
import { StepTimeline, type StepTimelineStatus, type StepTimelineStep } from '../StepTimeline';
import { Suggestions } from '../Suggestions';
import { SummaryDivider } from '../SummaryDivider';
import { Thinking } from '../Thinking';
import {
  type ChatAttachmentPart,
  type ChatSource,
  type ChatVersion,
  type ConversationTurn,
  DEFAULT_TRANSCRIPT_LABELS,
  Transcript,
  type TranscriptTurnSlots,
  type TurnContext,
} from '../Transcript';
import { VersionPager } from '../VersionPager';
import {
  type ConversationOpenSource,
  type ConversationRating,
  type ConversationTranscriptProps,
  DEFAULT_CONVERSATION_TRANSCRIPT_LABELS,
} from './ConversationTranscript.types';
import { conversationTranscriptPartVariants } from './ConversationTranscript.variants';

export { DEFAULT_CONVERSATION_TRANSCRIPT_LABELS };

/**
 * A conversation with the default composition of the chat parts, from props only: your questions, then each reply with its
 * step timeline, reasoning, markdown (code, citations), sources, actions (copy, regenerate, version pager, thumbs), the
 * feedback panel, follow-ups, approvals, the error with Retry, the stopped banner and summary dividers. Each part is drawn
 * only when its data or its callback is given. It is the Transcript's conversation mode with the slots filled in; for a
 * different arrangement use `Transcript` and its `slots`.
 *
 * @example
 * <ConversationTranscript turns={buildTurns(messages, runs)} copyIcon={<Copy />} onCite={(source) => open(source)} onSelectSuggestion={send} />
 */
export function ConversationTranscript<
  U extends ConversationTurn = ConversationTurn,
  V extends ChatVersion = ChatVersion,
  A extends ChatAttachmentPart = ChatAttachmentPart,
  S extends ChatSource = ChatSource,
  P extends ApprovalItem = ApprovalItem,
  R extends FeedbackReason = FeedbackReason,
>({
  icons = {},
  copyIcon,
  copiedIcon,
  labels: labelOverrides,
  transcriptLabels,
  partLabels = {},
  highlight,
  codeLineNumbers,
  wrapCode,
  copiedMs = 1500,
  stepLabel,
  stepDetail,
  onToggleSteps,
  onToggleThinking,
  onCite,
  onCopyCode,
  openSource: openSourceProp,
  defaultOpenSource = null,
  onOpenSourceChange,
  onToggleSource,
  onSelectSuggestion,
  onCopyReply,
  onRate,
  ratings,
  defaultRatings,
  feedbackReasons,
  onSubmitFeedback,
  onCancelFeedback,
  actionsMeta,
  approvals,
  onDecideApproval,
  summaries,
  onToggleSummary,
  extraActions,
  turns,
  onRetry,
  ...rest
}: ConversationTranscriptProps<U, V, A, S, P, R>) {
  const labels = { ...DEFAULT_CONVERSATION_TRANSCRIPT_LABELS, ...labelOverrides };
  const [openSource, setOpenSource] = useControllableState<ConversationOpenSource>(
    openSourceProp,
    defaultOpenSource,
    onOpenSourceChange,
  );
  const [ratingMap, setRatingMap] = useControllableState<Record<string, ConversationRating>>(
    ratings,
    defaultRatings ?? {},
  );
  const [feedbackFor, setFeedbackFor] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  const flash = (key: string) => {
    setCopied(key);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), copiedMs);
  };

  const turnAt = (index: number) => turns?.[index] as U;
  const canFeedback = Boolean(feedbackReasons && onSubmitFeedback);

  const rate = (turn: U, next: Exclude<ConversationRating, null>) => {
    const value = ratingMap[turn.id] === next ? null : next;
    setRatingMap({ ...ratingMap, [turn.id]: value });
    setFeedbackFor(value === 'down' && canFeedback ? turn.id : null);
    void onRate?.(turn, value);
  };

  const approvalsFor = (turn: U, pending: boolean) =>
    (approvals ?? [])
      .filter(
        (entry) =>
          entry.turnId === turn.id && ((entry.status ?? 'pending') === 'pending') === pending,
      )
      .map((entry) => (
        <ApprovalCard<P>
          key={entry.approval.id}
          approval={entry.approval}
          status={entry.status ?? 'pending'}
          icons={icons.approval}
          labels={partLabels.approval}
          className={conversationTranscriptPartVariants({ part: 'approval' })}
          onDecide={
            onDecideApproval
              ? (decision, approval) => onDecideApproval(approval, decision, turn)
              : undefined
          }
        />
      ));

  const slots: TranscriptTurnSlots<U> = {
    timeline: (turn, context) => {
      const steps = turn.answer?.steps ?? [];
      if (steps.length === 0) return null;
      const status: StepTimelineStatus = context.waiting
        ? 'waiting'
        : context.running
          ? 'running'
          : context.stopped
            ? 'stopped'
            : 'done';
      return (
        <StepTimeline
          steps={steps.map(
            (step): StepTimelineStep => ({
              id: step.id,
              icon: icons.step,
              label: stepLabel?.(step) ?? step.name,
              detail: step.done ? stepDetail?.(step) : undefined,
              state: step.failed ? 'failed' : step.done ? 'done' : 'running',
              parallel: steps.filter((other) => other.group === step.group).length > 1,
            }),
          )}
          status={status}
          seconds={turn.answer?.seconds}
          icons={{
            done: icons.stepDone,
            failed: icons.stepFailed,
            chevron: icons.chevron,
            spinner: icons.spinner,
          }}
          labels={partLabels.steps}
          onOpenChange={onToggleSteps ? (open) => onToggleSteps(turn, open) : undefined}
        />
      );
    },
    thinking: (turn, context) => {
      const text = context.liveReasoning ?? turn.answer?.reasoning?.text;
      if (!text && !context.liveReasoning) return null;
      return (
        <Thinking
          text={text}
          streaming={context.running && !context.text}
          seconds={turn.answer?.reasoning?.seconds}
          icon={icons.thinking}
          spinner={icons.spinner}
          chevron={icons.chevron}
          labels={partLabels.thinking}
          onOpenChange={onToggleThinking ? (open) => onToggleThinking(turn, open) : undefined}
        />
      );
    },
    sources: (turn) =>
      turn.answer?.sources.length ? (
        <Sources<ChatSource>
          items={turn.answer.sources}
          openN={openSource?.turnId === turn.id ? openSource.n : null}
          onToggle={(source, open) => {
            setOpenSource(open ? { turnId: turn.id, n: source.n } : null);
            onToggleSource?.(source as S, open, turn);
          }}
          cardIcon={icons.source}
          closeIcon={icons.sourceClose}
          labels={partLabels.sources}
        />
      ) : null,
    actions: (turn, context) => {
      const message = turn.answer?.final ?? turn.answer?.first;
      const siblings = turn.answer?.final?.siblings ?? turn.answer?.first.siblings ?? [];
      const rating = ratingMap[turn.id] ?? null;
      const actions: MessageAction[] = [];
      if (onCopyReply && copyIcon !== undefined && copyIcon !== null) {
        const done = copied === `reply:${turn.id}`;
        actions.push({
          id: 'copy',
          icon: done ? (copiedIcon ?? copyIcon) : copyIcon,
          label: done ? labels.copied : labels.copy,
          onClick: () => {
            flash(`reply:${turn.id}`);
            return onCopyReply(turn);
          },
        });
      }
      if (context.regenerate) {
        actions.push({
          id: 'regenerate',
          icon: icons.regenerate,
          label: labels.regenerate,
          disabled: context.running,
          onClick: context.regenerate,
        });
      }
      if (context.selectVersion && message && siblings.length > 1) {
        actions.push({
          id: 'versions',
          node: (
            <VersionPager<ChatVersion>
              index={Math.max(
                0,
                siblings.findIndex((version) => version.id === message.id),
              )}
              versions={siblings}
              previousIcon={icons.previous}
              nextIcon={icons.next}
              labels={partLabels.versions}
              onSelect={(version) => context.selectVersion?.(version)}
            />
          ),
        });
      }
      if (onRate) {
        actions.push(
          {
            id: 'up',
            icon: icons.thumbsUp,
            label: labels.goodReply,
            pressed: rating === 'up',
            onClick: () => rate(turn, 'up'),
          },
          {
            id: 'down',
            icon: icons.thumbsDown,
            label: labels.badReply,
            pressed: rating === 'down',
            onClick: () => rate(turn, 'down'),
          },
        );
      }
      actions.push(...(extraActions?.(turn) ?? []));
      if (actions.length === 0) return null;
      return (
        <MessageActions actions={actions} meta={actionsMeta?.(turn)} label={partLabels.actions} />
      );
    },
    feedback: (turn) =>
      canFeedback && feedbackFor === turn.id && feedbackReasons ? (
        <FeedbackPanel<R>
          reasons={feedbackReasons}
          className={conversationTranscriptPartVariants({ part: 'feedback' })}
          labels={partLabels.feedback}
          onCancel={() => {
            setFeedbackFor(null);
            return onCancelFeedback?.(turn);
          }}
          onSubmit={(feedback) => {
            setFeedbackFor(null);
            return onSubmitFeedback?.(turn, feedback);
          }}
        />
      ) : null,
    suggestions: (turn) =>
      onSelectSuggestion && turn.answer?.suggestions.length ? (
        <Suggestions
          items={turn.answer.suggestions.map((label) => ({ id: label, label }))}
          icon={icons.suggestion}
          label={partLabels.suggestions}
          onSelect={(_item, index) => onSelectSuggestion(turn.answer!.suggestions[index]!, turn)}
        />
      ) : null,
    approvalsBefore: (turn) => {
      const nodes = approvalsFor(turn, false);
      return nodes.length ? <>{nodes}</> : null;
    },
    approvalsAfter: (turn) => {
      const nodes = approvalsFor(turn, true);
      return nodes.length ? <>{nodes}</> : null;
    },
    error: (turn, context: TurnContext) => (
      <ErrorCard
        title={transcriptLabels?.failed ?? DEFAULT_TRANSCRIPT_LABELS.failed}
        message={turn.run?.error?.message}
        retryIcon={icons.retry}
        retryLabel={transcriptLabels?.retry ?? DEFAULT_TRANSCRIPT_LABELS.retry}
        onRetry={context.retry}
      />
    ),
    summaryDivider: (turn) => {
      const summary = summaries?.find((entry) => entry.turnId === turn.id);
      return summary ? (
        <SummaryDivider
          count={summary.count}
          text={summary.text}
          icon={icons.summary}
          chevron={icons.chevron}
          labels={partLabels.summary}
          onOpenChange={onToggleSummary ? (open) => onToggleSummary(summary, open) : undefined}
        />
      ) : null;
    },
  };

  return (
    <Transcript<never, U, V, A>
      {...rest}
      turns={turns ?? []}
      onRetry={onRetry}
      copyIcon={copyIcon}
      labels={transcriptLabels}
      slots={slots}
      renderMarkdown={(text, context) => {
        const turn = turnAt(context.index);
        const sources = context.running ? undefined : turn?.answer?.sources;
        return (
          <Markdown<ChatSource>
            text={text}
            streaming={context.streaming}
            highlight={highlight}
            codeLineNumbers={codeLineNumbers}
            wrapCode={wrapCode}
            sources={sources}
            copyIcon={copyIcon}
            copiedIcon={copiedIcon ?? copyIcon}
            copiedCode={copied?.startsWith('code:') ? copied.slice(5) : null}
            labels={partLabels.markdown}
            onCite={
              onCite && turn
                ? (source) => {
                    setOpenSource(
                      openSource?.turnId === turn.id && openSource.n === source.n
                        ? null
                        : { turnId: turn.id, n: source.n },
                    );
                    return onCite(source as S, turn);
                  }
                : undefined
            }
            onCopy={
              onCopyCode && turn
                ? (code, language) => {
                    flash(`code:${code}`);
                    return onCopyCode(code, language, turn);
                  }
                : undefined
            }
          />
        );
      }}
    />
  );
}
