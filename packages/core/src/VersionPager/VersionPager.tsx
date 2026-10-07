import { cn } from 'lib/utils';
import * as React from 'react';
import { IconButton } from '../IconButton';
import type { VersionItem, VersionPagerLabels, VersionPagerProps } from './VersionPager.types';

/** English strings of {@link VersionPager}. */
export const DEFAULT_VERSION_PAGER_LABELS: VersionPagerLabels = {
  previous: 'Previous version',
  next: 'Next version',
  group: 'Versions',
  position: (index, count) => `${index + 1} / ${count}`,
};

/**
 * Omni VersionPager: `‹ 2 / 3 ›` for a message with several versions (edits of your message, regenerations of a
 * reply). Previous and Next call `onMove(-1 | 1)` and disable at either end, and while `disabled`. The position is
 * announced politely when it changes.
 *
 * Slots: `data-slot="version-pager" | "version-pager-previous" | "version-pager-next" | "version-pager-position"`.
 *
 * @example
 * <VersionPager index={1} count={3} onMove={(step) => select(versions[1 + step])} previousIcon={<ChevronLeft />} nextIcon={<ChevronRight />} />
 */
const VersionPagerImpl = React.forwardRef<HTMLDivElement, VersionPagerProps>(
  (
    {
      index,
      count: countProp,
      versions,
      onMove,
      onSelect,
      disabled = false,
      previousIcon,
      nextIcon,
      labels: labelOverrides,
      className,
      ...rest
    },
    ref,
  ) => {
    const labels = { ...DEFAULT_VERSION_PAGER_LABELS, ...labelOverrides };
    if (!onMove && !onSelect) return null;
    const count = countProp ?? versions?.length ?? 0;
    const move = (step: -1 | 1) => {
      onMove?.(step, versions?.[index]);
      const target = versions?.[index + step];
      if (target) onSelect?.(target, index + step);
    };
    return (
      <div
        ref={ref}
        role="group"
        aria-label={labels.group}
        data-slot="version-pager"
        className={cn('inline-flex items-center gap-0.5', className)}
        {...rest}
      >
        <IconButton
          variant="ghost"
          iconSize="sm"
          label={labels.previous}
          data-slot="version-pager-previous"
          icon={previousIcon ?? <span aria-hidden="true">‹</span>}
          disabled={disabled || index <= 0}
          onClick={() => move(-1)}
        />
        <span
          data-slot="version-pager-position"
          aria-live="polite"
          className="min-w-9 text-center text-xs text-[color:var(--oui-panel-meta-fg)] tabular-nums"
        >
          {labels.position(index, count)}
        </span>
        <IconButton
          variant="ghost"
          iconSize="sm"
          label={labels.next}
          data-slot="version-pager-next"
          icon={nextIcon ?? <span aria-hidden="true">›</span>}
          disabled={disabled || index >= count - 1}
          onClick={() => move(1)}
        />
      </div>
    );
  },
);
VersionPagerImpl.displayName = 'VersionPager';

/** Generic over the version item type: an extended version reaches the callbacks by reference. */
export const VersionPager = VersionPagerImpl as unknown as <T extends VersionItem = VersionItem>(
  props: VersionPagerProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null;
