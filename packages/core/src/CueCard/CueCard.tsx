import { cn } from 'lib/utils';
import * as React from 'react';
import type {
  CueCardLabels,
  CueCardProps,
  CueLine,
  CueLineInput,
  CuePieceInput,
  CueRole,
  CueSection,
  CueSectionKind,
  CueSegment,
  HeardLineProps,
  HeardPiece,
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

const MARKS: Record<string, CueRole> = { '**': 'cue', '==': 'evidence', '!!': 'caution' };
const MARKED = /(\*\*|==|!!)(.+?)\1/g;

/** A marked sentence as pieces: `**cue**`, `==evidence==`, `!!caution!!`; the rest is spoken. */
function marked(text: string): CueSegment[] {
  const segments: CueSegment[] = [];
  let from = 0;
  for (const match of text.matchAll(MARKED)) {
    if (match.index > from) segments.push({ text: text.slice(from, match.index) });
    segments.push({ text: match[2] as string, role: MARKS[match[1] as string] as CueRole });
    from = match.index + match[0].length;
  }
  if (from < text.length || segments.length === 0) segments.push({ text: text.slice(from) });
  return segments;
}

/**
 * Any short form of a line as a {@link CueLine}. A string is a sentence with its key words marked
 * (`**cue**`, `==evidence==`, `!!caution!!`); a list is its pieces, where a string is spoken text taken
 * exactly as written.
 */
export function toCueLine<S extends CueSegment = CueSegment>(line: CueLineInput<S>): CueLine<S> {
  if (typeof line === 'string') return { segments: marked(line) as S[] };
  if ('segments' in line) return line;
  return {
    segments: line.map((piece: CuePieceInput<S>) =>
      typeof piece === 'string' ? ({ text: piece } as S) : piece,
    ),
  };
}

const textOf = (line: CueLine) => line.segments.map((segment) => segment.text).join('');

/**
 * The pieces of one {@link CueLine}, each drawn by its role (spoken, cue, evidence, caution, context). It is what
 * every line of a {@link CueCard} is made of, and is usable on its own inside any text element.
 *
 * Slot: `data-slot="cue-card-segment"` with `data-role`.
 *
 * @example
 * <p><CueLineText line={{ segments: [{ text: 'Start with ' }, { text: 'the result', role: 'cue' }] }} /></p>
 */
export function CueLineText<S extends CueSegment = CueSegment>({
  line,
  inferred = DEFAULT_CUE_CARD_LABELS.inferred,
  onSourceSelect,
}: {
  line: CueLineInput<S>;
  /** Tooltip of a piece whose grounding is `inferred`. */
  inferred?: string;
  /** A piece with a `source` was pressed. Without it the pieces are plain text. */
  onSourceSelect?: ((segment: S) => void) | undefined;
}): React.ReactElement {
  return (
    <>
      {toCueLine(line).segments.map((segment, at) => {
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
              'm-0 cursor-pointer rounded-sm border-0 bg-transparent p-0 [font-family:inherit] [font-size:inherit] [line-height:inherit] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50',
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
          const lines = (
            compact && section.kind === 'anchors'
              ? section.lines.slice(0, maxAnchors)
              : section.lines
          ).map(toCueLine);
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
                      // biome-ignore lint/suspicious/noArrayIndexKey: the lines of one section never reorder, and two may read the same
                      key={`${index}:${textOf(line)}`}
                      data-slot="cue-card-line"
                      className={cn(
                        'm-0 text-base leading-snug',
                        index === 0 && 'font-semibold',
                        index > 0 && 'text-[color:var(--oui-foreground)]',
                      )}
                    >
                      <CueLineText
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
          // Anchors belong to the lines they follow: they sit under them, indented to their text, with no
          // heading of their own unless one is given.
          const before = shown[at - 1]?.kind;
          const nested = anchors && (before === 'say' || before === 'ask');
          return (
            <div
              key={key}
              data-slot="cue-card-section"
              data-kind={section.kind}
              {...(nested ? { 'data-nested': '' } : {})}
              className={cn(
                'flex flex-col',
                quiet ? 'gap-1.5' : 'gap-2',
                nested &&
                  '-mt-3 ml-[18px] gap-1.5 border-l border-[color:var(--oui-panel-border)] pl-3.5',
              )}
            >
              {nested && section.label === undefined ? null : heading(section)}
              {lines.map((line, index) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: the lines of one section never reorder, and two may read the same
                  key={`${index}:${textOf(line)}`}
                  className={cn(
                    'flex min-w-0',
                    anchors ? 'gap-2.5' : 'gap-3',
                    quiet && 'pl-[18px]',
                  )}
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
                    <CueLineText
                      line={line}
                      inferred={labels.inferred}
                      onSourceSelect={onSourceSelect}
                    />
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
    const runs: HeardPiece[] = (typeof pieces === 'string' ? [pieces] : pieces).map((piece) =>
      typeof piece === 'string' ? { text: piece } : piece,
    );
    const whole = runs.map((piece) => piece.text).join('');
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
          {runs.map((piece, at) => (
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
