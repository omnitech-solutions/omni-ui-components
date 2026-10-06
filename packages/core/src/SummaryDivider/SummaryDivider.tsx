import * as React from 'react';

import { cn } from 'lib/utils';
import { useControllableState } from 'lib/use-controllable-state';
import type { SummaryDividerLabels, SummaryDividerProps } from './SummaryDivider.types';

/** English strings of {@link SummaryDivider}. */
export const DEFAULT_SUMMARY_DIVIDER_LABELS: SummaryDividerLabels = {
  summarised: (count) => `${count} earlier message${count === 1 ? '' : 's'} summarised`,
  note: 'The full history is still stored — only the model sees this summary.',
};

/**
 * Omni SummaryDivider: a rule in the conversation where the model's full view begins, with a disclosure
 * (`aria-expanded`) "N earlier messages summarised" that reveals the summary text and a note.
 *
 * Slots: `data-slot="summary-divider" | "summary-divider-toggle" | "summary-divider-body"`.
 *
 * @example
 * <SummaryDivider count={12} text={summary.text} icon={<ListCollapse />} chevron={<ChevronDown />} />
 */
export const SummaryDivider = React.forwardRef<HTMLDivElement, SummaryDividerProps>(
  ({ count, text, open, defaultOpen = false, onOpenChange, icon, chevron, labels: labelOverrides, className, ...rest }, ref) => {
    const labels = { ...DEFAULT_SUMMARY_DIVIDER_LABELS, ...labelOverrides };
    const [expanded, setExpanded] = useControllableState(open, defaultOpen, onOpenChange);
    const bodyId = React.useId();
    return (
      <div ref={ref} data-slot="summary-divider" className={cn('flex min-w-0 flex-col gap-2', className)} {...rest}>
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className="h-px flex-1 bg-[color:var(--oui-panel-divider)]" />
          <button
            type="button"
            data-slot="summary-divider-toggle"
            aria-expanded={expanded}
            aria-controls={expanded ? bodyId : undefined}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border-0 bg-transparent px-1 text-[12.5px] text-[color:var(--oui-panel-meta-fg)] hover:text-[color:var(--oui-tone-neutral-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
            onClick={() => setExpanded(!expanded)}
          >
            {icon ? (
              <span aria-hidden="true" className="inline-flex">
                {icon}
              </span>
            ) : null}
            {labels.summarised(count)}
            {chevron ? (
              <span aria-hidden="true" className={cn('inline-flex transition-transform motion-reduce:transition-none', expanded && 'rotate-180')}>
                {chevron}
              </span>
            ) : null}
          </button>
          <span aria-hidden="true" className="h-px flex-1 bg-[color:var(--oui-panel-divider)]" />
        </div>
        {expanded ? (
          <div
            id={bodyId}
            data-slot="summary-divider-body"
            className="rounded-lg bg-[color:var(--oui-panel-dock-bg)] px-3.5 py-2.5 text-[13px] leading-[1.6] text-[color:var(--oui-panel-meta-fg)]"
          >
            {text} {labels.note}
          </div>
        ) : null}
      </div>
    );
  },
);
SummaryDivider.displayName = 'SummaryDivider';
