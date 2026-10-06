import * as React from 'react';

import { cn } from 'lib/utils';
import { useControllableState } from '../lib/use-controllable-state';
import { Button } from '../Button';
import { TokenLines } from '../Highlight';
import { diffRows, diffStats, sumStats } from './DiffReview.utils';
import {
  diffAddClasses,
  diffCheckClasses,
  diffRemoveClasses,
  diffReviewClasses,
  diffReviewPillVariants,
  diffRowVariants,
  diffSignVariants,
  diffTabClasses,
} from './DiffReview.variants';
import type { DiffChange, DiffReviewAction, DiffReviewActionContext, DiffReviewLabels, DiffReviewProps, DiffReviewVariant } from './DiffReview.types';

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);

/** English defaults for every string. Pass a partial `labels` to translate or rephrase. */
export const DEFAULT_DIFF_REVIEW_LABELS: DiffReviewLabels = {
  region: 'Proposed change',
  title: 'Proposed change',
  checklistTitle: (count) => `${count} proposed changes`,
  summary: (count, added, removed) => `${count} ${plural(count, 'surface', 'surfaces')} · +${added} −${removed}`,
  emptySummary: 'Review before applying',
  checklistHint: 'Pick what to apply. You can undo afterwards.',
  statuses: {
    pending: 'Not applied',
    preview: 'Previewing',
    applied: 'Applied',
    rejected: 'Rejected',
    reverted: 'Rolled back',
    conflicted: 'Not applied',
  },
  notes: {
    pending: 'Nothing has been applied yet',
    preview: 'Showing in {product} — not applied',
    applied: 'Applied to {product}',
    rejected: 'Rejected — nothing changed',
    reverted: 'Rolled back — original restored',
    conflicted: 'Not applied — {product} changed since this was proposed',
  },
  tabs: 'Changed surfaces',
  gap: 'Unchanged lines hidden',
};

const mergeLabels = (labels?: Partial<DiffReviewLabels>): DiffReviewLabels => ({
  ...DEFAULT_DIFF_REVIEW_LABELS,
  ...labels,
  statuses: { ...DEFAULT_DIFF_REVIEW_LABELS.statuses, ...labels?.statuses },
  notes: { ...DEFAULT_DIFF_REVIEW_LABELS.notes, ...labels?.notes },
});

const Counts: React.FC<{ before: string; after: string }> = ({ before, after }) => {
  const { added, removed } = diffStats(before, after);
  return (
    <>
      {added > 0 ? (
        <span data-slot="diff-review-added" className={diffAddClasses}>
          +{added}
        </span>
      ) : null}
      {removed > 0 ? (
        <span data-slot="diff-review-removed" className={diffRemoveClasses}>
          −{removed}
        </span>
      ) : null}
    </>
  );
};

/**
 * Omni DiffReview: a reviewable proposed change. Each change carries its text before and after; the `diff` variant
 * shows one tab per change with a unified diff (changed lines plus a line of context, `⋯` where lines are hidden,
 * optional syntax colours through the `highlight` prop), the `checklist` variant shows one tickable row per change
 * for a partial apply. A status pill, a footer note and a row of caller-defined `actions` frame it. The component
 * keeps only the selected tab and the unticked ids; every transition and callback belongs to the caller.
 *
 * Tabs follow the tablist pattern: Left and Right (wrapping), Home and End move and select.
 *
 * @example
 * <DiffReview changes={changes} status="pending" highlight={highlightLines} actions={phaseActions({ status: 'pending', ... })} />
 * <DiffReview variant="checklist" changes={changes} actions={[{ key: 'apply', primary: true, label: ({ selected }) => `Apply ${selected.length}`, onClick: apply }]} />
 */
const DiffReviewInner = React.forwardRef<HTMLElement, DiffReviewProps>(
  (
    {
      changes,
      status = 'pending',
      variant = 'diff',
      highlight,
      contextLines = 1,
      actions = [],
      note,
      product = '',
      fallback,
      labels: labelsProp,
      icons,
      activeId: activeIdProp,
      defaultActiveId,
      onTabChange,
      selectedIds: selectedProp,
      onSelectionChange,
      className,
      ...rest
    },
    ref,
  ) => {
    const labels = React.useMemo(() => mergeLabels(labelsProp), [labelsProp]);
    const baseId = React.useId();
    const effectiveVariant: DiffReviewVariant = variant === 'checklist' && changes.length > 1 ? 'checklist' : 'diff';
    const checklist = effectiveVariant === 'checklist';

    const [activeId, setActiveId] = useControllableState<string | undefined>(activeIdProp, defaultActiveId ?? changes[0]?.id);
    // What the person unticked; everything else is selected, including changes that arrive after the card first showed.
    const [unticked, setUnticked] = React.useState<ReadonlySet<string>>(() => new Set());
    const selectedIds = selectedProp ?? changes.map((change) => change.id).filter((id) => !unticked.has(id));
    const current: DiffChange | undefined = changes.find((change) => change.id === activeId) ?? changes[0];

    const rows = React.useMemo(
      () => (current ? diffRows(current.before, current.after, { highlight, language: current.language, contextLines }) : []),
      [current, highlight, contextLines],
    );
    const totals = React.useMemo(() => sumStats(changes), [changes]);

    const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
    const selectTab = (id: string, focus = false) => {
      setActiveId(id);
      const change = changes.find((each) => each.id === id);
      if (change) onTabChange?.(change);
      if (focus) tabRefs.current[id]?.focus();
    };
    const onTabKeyDown = (event: React.KeyboardEvent) => {
      const index = changes.findIndex((change) => change.id === current?.id);
      const move = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: changes.length - 1 }[event.key];
      if (move === undefined) return;
      event.preventDefault();
      const target = changes[(move + changes.length) % changes.length];
      if (target) selectTab(target.id, true);
    };

    const toggle = (id: string) => {
      const ticked = selectedIds.includes(id) ? selectedIds.filter((each) => each !== id) : [...selectedIds, id];
      if (selectedProp === undefined) setUnticked(new Set(changes.map((change) => change.id).filter((each) => !ticked.includes(each))));
      onSelectionChange?.(changes.filter((change) => ticked.includes(change.id)));
    };

    const selected = changes.filter((change) => selectedIds.includes(change.id));
    const context: DiffReviewActionContext = { changes, selected, variant: effectiveVariant, status };
    const resolveLabel = (action: DiffReviewAction) => (typeof action.label === 'function' ? action.label(context) : action.label);
    const resolveDisabled = (action: DiffReviewAction) => (typeof action.disabled === 'function' ? action.disabled(context) : Boolean(action.disabled));

    const noteText = labels.notes[status].replace('{product}', product || 'the app');
    const badge = checklist ? icons?.checklistBadge : icons?.badge;

    return (
      <section
        ref={ref}
        aria-label={labels.region}
        data-slot="diff-review"
        data-status={status}
        data-variant={effectiveVariant}
        className={cn(diffReviewClasses, className)}
        {...rest}
      >
        <div data-slot="diff-review-header" className="flex items-center gap-2.5 border-b border-solid border-[color:var(--oui-panel-divider)] px-3.5 py-2.5">
          {badge ? (
            <span
              data-slot="diff-review-badge"
              aria-hidden="true"
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-[color:var(--oui-tone-accent-bg)] text-[color:var(--oui-tone-accent-fg)] [&_svg]:size-4"
            >
              {badge}
            </span>
          ) : null}
          <div data-slot="diff-review-title" className="min-w-0">
            <div className="font-medium">{checklist ? labels.checklistTitle(changes.length) : labels.title}</div>
            <div className="text-xs text-[color:var(--oui-panel-meta-fg)]">
              {checklist ? labels.checklistHint : changes.length ? labels.summary(changes.length, totals.added, totals.removed) : labels.emptySummary}
            </div>
          </div>
          <span data-slot="diff-review-status" data-status={status} className={diffReviewPillVariants({ status })}>
            {labels.statuses[status]}
          </span>
        </div>

        {!checklist && current ? (
          <>
            <div
              role="tablist"
              aria-label={labels.tabs}
              data-slot="diff-review-tabs"
              onKeyDown={onTabKeyDown}
              className="flex overflow-x-auto border-b border-solid border-[color:var(--oui-panel-divider)]"
            >
              {changes.map((change) => {
                const selected = change.id === current.id;
                return (
                  <button
                    key={change.id}
                    ref={(node) => {
                      tabRefs.current[change.id] = node;
                    }}
                    type="button"
                    role="tab"
                    id={`${baseId}-tab-${change.id}`}
                    aria-selected={selected}
                    aria-controls={`${baseId}-panel`}
                    tabIndex={selected ? 0 : -1}
                    data-slot="diff-review-tab"
                    className={diffTabClasses}
                    onClick={() => selectTab(change.id)}
                  >
                    {change.label}
                    <Counts before={change.before} after={change.after} />
                  </button>
                );
              })}
            </div>
            <div
              role="tabpanel"
              id={`${baseId}-panel`}
              aria-labelledby={`${baseId}-tab-${current.id}`}
              tabIndex={0}
              data-slot="diff-review-diff"
              className="max-h-80 overflow-auto bg-[color:var(--oui-panel-dock-bg)] py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              {rows.map((row, index) =>
                row.kind === 'gap' ? (
                  <div
                    key={index}
                    role="separator"
                    aria-label={labels.gap}
                    data-slot="diff-review-gap"
                    className="px-3 text-center font-mono text-xs leading-[1.55] text-[color:var(--oui-code-gutter)] select-none"
                  >
                    ⋯
                  </div>
                ) : (
                  <div key={index} data-slot="diff-review-row" data-kind={row.kind} className={diffRowVariants({ kind: row.kind })}>
                    <span aria-hidden="true" data-slot="diff-review-sign" className={diffSignVariants({ kind: row.kind })}>
                      {row.kind === 'add' ? '+' : row.kind === 'remove' ? '−' : ''}
                    </span>
                    <TokenLines lines={[row.tokens]} className="min-w-0 flex-1 pr-3 break-words whitespace-pre-wrap" />
                  </div>
                ),
              )}
            </div>
          </>
        ) : null}

        {!changes.length && fallback !== undefined ? (
          <div data-slot="diff-review-fallback" className="max-h-60 overflow-auto bg-[color:var(--oui-panel-dock-bg)] px-3.5 py-2 font-mono text-xs whitespace-pre-wrap">
            {fallback}
          </div>
        ) : null}

        {checklist ? (
          <ul data-slot="diff-review-checklist" className="m-0 list-none p-0">
            {changes.map((change) => {
              const on = selectedIds.includes(change.id);
              const icon = change.icon ?? icons?.change;
              return (
                <li
                  key={change.id}
                  data-slot="diff-review-check-row"
                  className="flex items-center gap-2.5 border-b border-solid border-[color:var(--oui-panel-divider)] px-3.5 py-2 last:border-b-0"
                >
                  <button
                    type="button"
                    aria-pressed={on}
                    aria-label={change.label}
                    disabled={status !== 'pending'}
                    data-slot="diff-review-check"
                    className={diffCheckClasses}
                    onClick={() => toggle(change.id)}
                  />
                  {icon ? (
                    <span aria-hidden="true" className="inline-flex shrink-0 text-[color:var(--oui-panel-meta-fg)] [&_svg]:size-4">
                      {icon}
                    </span>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div>{change.label}</div>
                    {change.description ? <div className="text-xs text-[color:var(--oui-panel-meta-fg)]">{change.description}</div> : null}
                  </div>
                  <Counts before={change.before} after={change.after} />
                </li>
              );
            })}
          </ul>
        ) : null}

        <div
          data-slot="diff-review-footer"
          className="flex flex-wrap items-center justify-end gap-2 border-t border-solid border-[color:var(--oui-panel-divider)] px-3.5 py-2.5"
        >
          <span data-slot="diff-review-note" className="mr-auto inline-flex min-w-0 items-center gap-1.5 text-xs text-[color:var(--oui-panel-meta-fg)] [&_svg]:size-3.5 [&_svg]:shrink-0">
            {icons?.notes?.[status] ? <span aria-hidden="true">{icons.notes[status]}</span> : null}
            {note ?? noteText}
          </span>
          {actions
            .filter((action) => action.onClick)
            .map((action) => (
            <Button
              key={action.key}
              type="button"
              buttonSize="sm"
              variant={action.primary ? 'default' : 'outline'}
              icon={action.icon}
              disabled={resolveDisabled(action)}
              data-slot="diff-review-action"
              data-action={action.key}
              onClick={() => void action.onClick(context)}
            >
              {resolveLabel(action)}
            </Button>
          ))}
        </div>
      </section>
    );
  },
);
DiffReviewInner.displayName = 'DiffReview';

/** Generic over the change type: extra fields on your changes reach every callback by reference. */
export const DiffReview = DiffReviewInner as <C extends DiffChange = DiffChange>(props: DiffReviewProps<C> & React.RefAttributes<HTMLElement>) => React.ReactElement | null;
