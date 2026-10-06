import * as React from 'react';

import { cn } from 'lib/utils';
import { useControllableState } from 'lib/use-controllable-state';
import { IconButton } from '../IconButton';
import type { SourceItem, SourcesLabels, SourcesProps } from './Sources.types';
import { sourceCardClasses, sourceChipVariants, sourceNumberClasses } from './Sources.variants';

/** English strings of {@link Sources}. */
export const DEFAULT_SOURCES_LABELS: SourcesLabels = {
  group: 'Sources',
  close: 'Close',
};

/**
 * Omni Sources: one chip per source the reply cites (`n`, title, meta) and one quote card at a time. A chip is a
 * toggle (`aria-pressed`) that opens its card; choosing it again, or the card's close control, closes it. The
 * open source is controlled with `openN` (so a citation pill in the Markdown can open it) or kept inside.
 *
 * Slots: `data-slot="sources" | "sources-chip" | "sources-card" | "sources-close"`.
 *
 * @example
 * <Sources items={sources} openN={open} onToggle={setOpen} cardIcon={<FileText />} closeIcon={<X />} />
 */
const SourcesImpl = React.forwardRef<HTMLDivElement, SourcesProps>(
  ({ items, openN, defaultOpenN = null, onToggle, onClose, cardIcon, closeIcon, renderCard, labels: labelOverrides, className, ...rest }, ref) => {
    const labels = { ...DEFAULT_SOURCES_LABELS, ...labelOverrides };
    const [open, setOpenN] = useControllableState<number | null>(openN, defaultOpenN);
    const cardId = React.useId();
    const opened: SourceItem | undefined = items.find((item) => item.n === open);
    // Every change reports the source that closed and the one that opened, as the full items.
    const setOpen = (next: number | null) => {
      const target = next === null ? undefined : items.find((item) => item.n === next);
      if (opened && opened !== target) onToggle?.(opened, false);
      if (target) onToggle?.(target, true);
      setOpenN(next);
    };
    const close = () => {
      if (opened) onClose?.(opened);
      setOpen(null);
    };

    if (items.length === 0) return null;
    return (
      <div ref={ref} data-slot="sources" className={cn('flex min-w-0 flex-col', className)} {...rest}>
        <div role="group" aria-label={labels.group} className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <button
              key={item.n}
              type="button"
              data-slot="sources-chip"
              aria-pressed={open === item.n}
              aria-controls={open === item.n ? cardId : undefined}
              className={sourceChipVariants()}
              onClick={() => setOpen(open === item.n ? null : item.n)}
            >
              <span className={sourceNumberClasses}>{item.n}</span>
              <span className="min-w-0 truncate font-medium">{item.title}</span>
              {item.meta ? <span className="flex-none text-[11px] text-[color:var(--oui-panel-meta-fg)]">{item.meta}</span> : null}
            </button>
          ))}
        </div>
        {opened ? (
          renderCard ? (
            <div id={cardId} data-slot="sources-card">
              {renderCard(opened, close)}
            </div>
          ) : (
            <div id={cardId} role="group" aria-label={opened.title} data-slot="sources-card" className={sourceCardClasses}>
              <div className="flex items-center gap-2">
                {cardIcon ? (
                  <span aria-hidden="true" className="inline-flex flex-none text-[color:var(--oui-panel-meta-fg)] [&_svg]:size-4">
                    {cardIcon}
                  </span>
                ) : null}
                <strong className="min-w-0 truncate font-semibold">{opened.title}</strong>
                {opened.meta ? <span className="flex-none text-[11px] text-[color:var(--oui-panel-meta-fg)]">{opened.meta}</span> : null}
                <span className="flex-1" />
                <IconButton
                  variant="ghost"
                  iconSize="sm"
                  label={labels.close}
                  data-slot="sources-close"
                  icon={closeIcon ?? <span aria-hidden="true">×</span>}
                  onClick={close}
                />
              </div>
              <blockquote className="m-0 mt-1.5 text-[color:var(--oui-panel-meta-fg)] italic">“{opened.quote}”</blockquote>
            </div>
          )
        ) : null}
      </div>
    );
  },
);
SourcesImpl.displayName = 'Sources';

/** Generic over the item type: an extended item flows to every callback and slot, by reference. */
export const Sources = SourcesImpl as unknown as <T extends SourceItem = SourceItem>(
  props: SourcesProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null;
