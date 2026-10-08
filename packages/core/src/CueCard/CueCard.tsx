import { cn } from 'lib/utils';
import * as React from 'react';
import type {
  CueCardLabels,
  CueCardProps,
  CueLine,
  CueRole,
  CueSection,
  CueSectionKind,
  CueSegment,
  HeardLineProps,
} from './CueCard.types';

/** English strings of {@link CueCard}. */
export const DEFAULT_CUE_CARD_LABELS: CueCardLabels = {
  sections: {
    say: 'Say this',
    anchors: 'Anchors',
    ask: 'Ask',
    caution: 'Careful',
    context: 'Context',
  },
  preparing: 'Preparing response…',
  updating: 'Updating…',
  inferred: 'Not confirmed: check before saying',
};

// The colour vocabulary, here and nowhere else: green is say or act now, blue is evidence, amber is caution,
// grey is context. The sentence itself is the foreground colour, so a card is never a wall of highlights.
const ROLE_CLASS: Record<CueRole, string> = {
  spoken: '',
  cue: 'font-semibold',
  evidence: 'font-semibold text-[color:var(--oui-tone-accent-fg)]',
  caution: 'font-semibold text-[color:var(--oui-tone-warning-fg)]',
  context: 'text-[color:var(--oui-panel-meta-fg)]',
};
const LABEL_CLASS: Record<CueSectionKind, string> = {
  say: 'text-[color:var(--oui-tone-success-fg)]',
  ask: 'text-[color:var(--oui-tone-success-fg)]',
  anchors: 'text-[color:var(--oui-tone-accent-fg)]',
  caution: 'text-[color:var(--oui-tone-warning-fg)]',
  context: 'text-[color:var(--oui-panel-meta-fg)]',
};
const COMPACT_KINDS: readonly CueSectionKind[] = ['say', 'anchors', 'caution'];

const textOf = (line: CueLine) => line.segments.map((segment) => segment.text).join('');

function Line<S extends CueSegment>({
  line,
  inferred,
  onSourceSelect,
}: {
  line: CueLine<S>;
  inferred: string;
  onSourceSelect?: ((segment: S) => void) | undefined;
}) {
  return (
    <>
      {line.segments.map((segment, at) => {
        const role = segment.role ?? 'spoken';
        const unconfirmed = segment.grounding === 'inferred';
        const className = cn(
          ROLE_CLASS[role],
          unconfirmed &&
            'underline decoration-[color:var(--oui-tone-warning-fg)] decoration-dotted underline-offset-4',
        );
        const shared = {
          'data-slot': 'cue-card-segment',
          'data-role': role,
          ...(segment.source ? { 'data-source': segment.source } : {}),
          ...(unconfirmed ? { title: inferred } : {}),
        } as const;
        // The pieces of one line never reorder.
        const key = `${at}:${segment.text}`;
        return segment.source && onSourceSelect ? (
          <button
            key={key}
            type="button"
            {...shared}
            className={cn(
              className,
              'cursor-pointer rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50',
            )}
            onClick={() => onSourceSelect(segment)}
          >
            {segment.text}
          </button>
        ) : (
          <span key={key} {...shared} className={className}>
            {segment.text}
          </span>
        );
      })}
    </>
  );
}

/**
 * Omni CueCard: what to say next, readable in the two seconds a person has while still listening. The content is
 * structured (sections of one-sentence lines, each piece with a role) and the card alone decides how it looks:
 * the response in the foreground colour with each sentence on its own mark, evidence in the accent colour, a
 * caution in an amber box whose first line names it, context small and quiet. `compact` keeps only the response,
 * a few anchors and any caution. `pending` says a newer revision is on its way and leaves what is ready on show.
 *
 * Slots: `data-slot="cue-card" | "cue-card-section" | "cue-card-label" | "cue-card-line" | "cue-card-segment" |
 * "cue-card-status"`.
 *
 * @example
 * <CueCard sections={[{ kind: 'say', lines: [{ segments: [{ text: 'At ' }, { text: 'Relay', role: 'evidence' }, { text: ' I built quoting.' }] }] }]} />
 */
const CueCardImpl = React.forwardRef<HTMLElement, CueCardProps>(
  (
    {
      sections,
      mode = 'detail',
      maxAnchors = 3,
      status = 'ready',
      onSourceSelect,
      cautionIcon,
      children,
      labels: labelOverrides,
      className,
      ...rest
    },
    ref,
  ) => {
    const labels: CueCardLabels = {
      ...DEFAULT_CUE_CARD_LABELS,
      ...labelOverrides,
      sections: { ...DEFAULT_CUE_CARD_LABELS.sections, ...labelOverrides?.sections },
    };
    const compact = mode === 'compact';
    const shown = (
      compact ? sections.filter((section) => COMPACT_KINDS.includes(section.kind)) : sections
    ).filter((section) => section.lines.length > 0);
    const heading = (section: CueSection) => {
      const text = section.label ?? labels.sections[section.kind];
      return text === '' ? null : (
        <span
          data-slot="cue-card-label"
          className={cn(
            'mb-0.5 text-[11px] font-bold tracking-[0.09em] uppercase',
            LABEL_CLASS[section.kind],
          )}
        >
          {text}
        </span>
      );
    };
    return (
      <article
        ref={ref}
        data-slot="cue-card"
        data-mode={mode}
        data-status={status}
        className={cn('flex min-w-0 flex-col gap-6 text-[color:var(--oui-foreground)]', className)}
        {...rest}
      >
        {shown.map((section, at) => {
          const lines =
            compact && section.kind === 'anchors'
              ? section.lines.slice(0, maxAnchors)
              : section.lines;
          // Sections of one card never reorder.
          const key = `${at}:${section.kind}`;
          if (section.kind === 'caution')
            return (
              <div
                key={key}
                data-slot="cue-card-section"
                data-kind="caution"
                className="flex gap-2.5 rounded-lg border border-[color:var(--oui-tone-warning-border)] bg-[color:var(--oui-tone-warning-bg)] px-3 py-2.5 text-[color:var(--oui-tone-warning-fg)]"
              >
                {cautionIcon && <span className="mt-0.5 shrink-0">{cautionIcon}</span>}
                <div className="flex min-w-0 flex-col gap-1">
                  {heading(section)}
                  {lines.map((line, index) => (
                    <p
                      key={textOf(line)}
                      data-slot="cue-card-line"
                      className={cn(
                        'm-0 text-base leading-snug',
                        index > 0 && 'text-[color:var(--oui-foreground)]',
                      )}
                    >
                      <Line
                        line={line}
                        inferred={labels.inferred}
                        onSourceSelect={onSourceSelect}
                      />
                    </p>
                  ))}
                </div>
              </div>
            );
          const anchors = section.kind === 'anchors';
          const quiet = section.kind === 'context';
          return (
            <div
              key={key}
              data-slot="cue-card-section"
              data-kind={section.kind}
              className="flex flex-col gap-2.5"
            >
              {heading(section)}
              {lines.map((line) => (
                <div
                  key={textOf(line)}
                  className={cn('flex min-w-0', anchors ? 'gap-2.5' : 'gap-3')}
                >
                  {!quiet && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        'size-1.5 shrink-0',
                        anchors
                          ? 'mt-2 rounded-[1.5px] bg-[color:var(--oui-tone-accent-fg)]'
                          : 'mt-[11px] rounded-full bg-[color:var(--oui-panel-meta-fg)]',
                      )}
                    />
                  )}
                  <p
                    data-slot="cue-card-line"
                    className={cn(
                      'm-0 min-w-0',
                      quiet
                        ? 'text-sm leading-normal text-[color:var(--oui-panel-meta-fg)]'
                        : anchors
                          ? 'text-base leading-snug'
                          : 'text-[19px] leading-[1.42]',
                    )}
                  >
                    <Line line={line} inferred={labels.inferred} onSourceSelect={onSourceSelect} />
                  </p>
                </div>
              ))}
            </div>
          );
        })}
        {!compact && children}
        {status === 'pending' && (
          <p
            data-slot="cue-card-status"
            role="status"
            className="m-0 text-sm text-[color:var(--oui-panel-meta-fg)] italic"
          >
            {shown.length > 0 ? labels.updating : labels.preparing}
          </p>
        )}
      </article>
    );
  },
);
CueCardImpl.displayName = 'CueCard';

/** Generic over the segment type: an extended segment reaches `onSourceSelect` by reference. */
export const CueCard = CueCardImpl as unknown as <S extends CueSegment = CueSegment>(
  props: CueCardProps<S> & React.RefAttributes<HTMLElement>,
) => React.ReactElement | null;

/**
 * Omni HeardLine: a sentence as it was heard, for placing what follows and not for reading out. All grey it
 * cannot be scanned and all foreground it competes with the card under it, so the words that carry it are lifted
 * a little and the rest stays quiet. It is cut after `maxLines`; the whole sentence is in its tooltip.
 *
 * Slots: `data-slot="heard-line" | "heard-line-label" | "heard-line-text"`.
 *
 * @example
 * <HeardLine label="Follow-up · 11:46" tone="ask" pieces={[{ text: 'What about ' }, { text: 'event-driven approaches', strong: true }]} />
 */
export const HeardLine = React.forwardRef<HTMLDivElement, HeardLineProps>(
  ({ pieces, label, tone = 'plain', maxLines = 2, className, ...rest }, ref) => {
    const whole = pieces.map((piece) => piece.text).join('');
    return (
      <div
        ref={ref}
        data-slot="heard-line"
        data-tone={tone}
        className={cn(
          'flex min-w-0 flex-col gap-1',
          tone === 'ask' && 'border-l-4 border-[color:var(--oui-tone-success-fg)] pl-3.5',
          className,
        )}
        {...rest}
      >
        {label && (
          <span
            data-slot="heard-line-label"
            className={cn(
              'text-[11px] font-semibold tracking-[0.08em] uppercase',
              tone === 'ask'
                ? 'text-[color:var(--oui-tone-success-fg)]'
                : 'text-[color:var(--oui-panel-meta-fg)]',
            )}
          >
            {label}
          </span>
        )}
        <p
          data-slot="heard-line-text"
          title={whole}
          className="m-0 overflow-hidden text-[15px] leading-normal text-[color:var(--oui-panel-meta-fg)]"
          style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: maxLines }}
        >
          {pieces.map((piece, at) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: the runs of one sentence never reorder
              key={`${at}:${piece.text}`}
              className={
                piece.strong ? 'font-medium text-[color:var(--oui-foreground)]' : undefined
              }
            >
              {piece.text}
            </span>
          ))}
        </p>
      </div>
    );
  },
);
HeardLine.displayName = 'HeardLine';
