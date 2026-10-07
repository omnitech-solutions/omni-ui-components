import { cn } from 'lib/utils';
import * as React from 'react';
import { IconButton } from '../IconButton';
import { DEFAULT_QUEUED_LABELS, type QueuedItem, type QueuedListProps } from './QueuedList.types';

/**
 * The "Queued ..." rows above a composer: messages sent while a reply is running, flushed in order when it ends.
 * Renders nothing when `items` is empty. Each row is `icon`, `labels.queued`, the (truncated) text and a remove
 * button when `onRemove` is set. Slot: `data-slot="queued-list" | "queued-item" | "queued-remove"`.
 *
 * @example
 * <QueuedList items={queue} onRemove={(item) => dequeue(item.id)} icon={<Clock />} removeIcon={<X />} />
 */
function QueuedListInner<T extends QueuedItem = QueuedItem>(
  { items, onRemove, icon, removeIcon, labels: labelsProp, className, ...rest }: QueuedListProps<T>,
  ref: React.ForwardedRef<HTMLUListElement>,
) {
  const labels = { ...DEFAULT_QUEUED_LABELS, ...labelsProp };
  if (items.length === 0) return null;
  return (
    <ul
      ref={ref}
      aria-label={labels.list}
      data-slot="queued-list"
      className={cn('m-0 flex list-none flex-col gap-1 p-0', className)}
      {...rest}
    >
      {items.map((item) => (
        <li
          key={item.id}
          data-slot="queued-item"
          className="flex min-w-0 items-center gap-2 rounded-lg border border-solid border-[color:var(--oui-panel-divider)] bg-[color:color-mix(in_srgb,var(--oui-panel-dock-bg)_calc(var(--oui-panel-see-through,1)_*_100%),transparent)] py-1 pr-1 pl-2.5 text-[13px]"
        >
          {icon ? (
            <span
              aria-hidden="true"
              className="inline-flex flex-none text-[color:var(--oui-panel-meta-fg)] [&_svg]:size-3.5"
            >
              {icon}
            </span>
          ) : null}
          <span className="flex-none text-[color:var(--oui-panel-meta-fg)]">{labels.queued}</span>
          <span className="min-w-0 flex-1 truncate" title={item.text}>
            {item.text}
          </span>
          {onRemove ? (
            <IconButton
              variant="ghost"
              iconSize="sm"
              icon={removeIcon ?? <span aria-hidden="true">×</span>}
              label={labels.remove}
              data-slot="queued-remove"
              className="size-6 flex-none rounded-md"
              onClick={() => void onRemove(item)}
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export const QueuedList = React.forwardRef(QueuedListInner) as <T extends QueuedItem = QueuedItem>(
  props: QueuedListProps<T> & { ref?: React.Ref<HTMLUListElement> },
) => React.ReactElement | null;
(QueuedList as { displayName?: string }).displayName = 'QueuedList';
