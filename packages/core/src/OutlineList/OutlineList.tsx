import { cn } from 'lib/utils';
import * as React from 'react';
import { List, ListItem } from '../List';
import { useControllableState } from '../lib/use-controllable-state';
import { useRovingTabindex } from '../lib/use-roving-tabindex';
import type {
  OutlineItem,
  OutlineListItemProps,
  OutlineListLabels,
  OutlineListProps,
  OutlineRowState,
} from './OutlineList.types';

/** English strings of {@link OutlineList}. */
export const DEFAULT_OUTLINE_LIST_LABELS: OutlineListLabels = {
  list: 'Outline',
  live: 'live',
};

/**
 * One row of an {@link OutlineList}, usable on its own: a number, a label that wraps, a quiet meta line and an
 * optional `trailing` part (a `Tag`, a `Badge`). It is a button when `onSelect` is given, plain otherwise.
 *
 * Slots: `data-slot="outline-list-row" | "outline-list-number" | "outline-list-label" | "outline-list-meta" |
 * "outline-list-trailing"`.
 *
 * @example
 * <OutlineListItem item={question} number={3} current onSelect={(q) => open(q.id)} />
 */
export const OutlineListItem = <T extends OutlineItem = OutlineItem>({
  item,
  number = item.number ?? '',
  current = false,
  live = item.state === 'live',
  onSelect,
  labels: labelOverrides,
  className,
}: OutlineListItemProps<T>): React.ReactElement => {
  const labels = { ...DEFAULT_OUTLINE_LIST_LABELS, ...labelOverrides };
  const name = item.name ?? (typeof item.label === 'string' ? item.label : undefined);
  const body = (
    <>
      <span
        data-slot="outline-list-number"
        className={cn(
          'w-4 shrink-0 pt-px font-mono text-xs tabular-nums',
          live
            ? 'text-[color:var(--oui-tone-success-fg)]'
            : current
              ? 'text-[color:var(--oui-foreground)]'
              : 'text-[color:var(--oui-panel-meta-fg)]',
        )}
      >
        {number}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          data-slot="outline-list-label"
          className={cn(
            'text-[13.5px] leading-snug break-words',
            live
              ? 'font-semibold text-[color:var(--oui-tone-success-fg)]'
              : current
                ? 'font-medium text-[color:var(--oui-foreground)]'
                : 'text-[color:var(--oui-foreground-muted)]',
          )}
        >
          {item.label}
        </span>
        {(item.meta || live) && (
          <span
            data-slot="outline-list-meta"
            className="text-[11.5px] text-[color:var(--oui-panel-meta-fg)]"
          >
            {item.meta}
            {item.meta && live ? ' · ' : ''}
            {live ? labels.live : ''}
          </span>
        )}
      </span>
      {item.trailing && (
        <span data-slot="outline-list-trailing" className="shrink-0 self-start">
          {item.trailing}
        </span>
      )}
    </>
  );
  const rowClass = cn(
    'flex w-full gap-2.5 rounded-lg border-l-[3px] py-2 pr-2.5 pl-2 text-left outline-none',
    live
      ? 'border-[color:var(--oui-tone-success-fg)] bg-[color:var(--oui-tone-success-bg)]'
      : current
        ? 'border-[color:var(--oui-foreground)] bg-[color:color-mix(in_srgb,var(--oui-foreground)_8%,transparent)]'
        : 'border-transparent',
  );
  return onSelect ? (
    <button
      type="button"
      data-slot="outline-list-row"
      data-state={live ? 'live' : 'default'}
      aria-current={current ? 'true' : undefined}
      title={name}
      className={cn(
        rowClass,
        'cursor-pointer hover:bg-[color:color-mix(in_srgb,var(--oui-foreground)_6%,transparent)] focus-visible:ring-2 focus-visible:ring-ring/50',
        className,
      )}
      onClick={() => onSelect(item)}
    >
      {body}
    </button>
  ) : (
    <div
      data-slot="outline-list-row"
      data-state={live ? 'live' : 'default'}
      className={cn(rowClass, className)}
    >
      {body}
    </div>
  );
};

/**
 * Omni OutlineList: a numbered list of things to jump to (the questions of a call, the steps of a run). The chosen
 * row is marked with a bar; the `live` row is green, so "what is happening now" and "what I am reading" never
 * look alike.
 *
 * Made of the library's own parts: the `List` and `ListItem` hold the rows, each row is an
 * {@link OutlineListItem} (or whatever `renderItem` returns), keyboard movement is the shared roving tabindex,
 * and the heading, count and scrolling come from the `Panel` it is placed in.
 *
 * Slots: `data-slot="outline-list"` and those of {@link OutlineListItem}.
 *
 * @example
 * <Panel title="Questions" meta="newest first" scroll={{ thinScrollbar: true }}>
 *   <OutlineList aria-label="Questions" items={questions} value={shown} onValueChange={(item) => show(item.id)} order="reversed" />
 * </Panel>
 */
const OutlineListImpl = React.forwardRef<HTMLDivElement, OutlineListProps>(
  (
    {
      items,
      value,
      defaultValue = null,
      onValueChange,
      order = 'as-given',
      renderItem,
      empty,
      labels: labelOverrides,
      className,
      ...rest
    },
    ref,
  ) => {
    const labels = { ...DEFAULT_OUTLINE_LIST_LABELS, ...labelOverrides };
    const [chosen, setChosen] = useControllableState<string | null>(value, defaultValue);
    const numbered = items.map((item, index) => ({ item, number: item.number ?? index + 1 }));
    const rows = order === 'reversed' ? [...numbered].reverse() : numbered;
    const list = React.useRef<HTMLUListElement>(null);
    // One tab stop for the whole list; arrows, Home and End move between rows.
    const roving = useRovingTabindex(list, {
      orientation: 'vertical',
      loop: false,
      getItems: (root) => [
        ...root.querySelectorAll<HTMLElement>('button[data-slot="outline-list-row"]'),
      ],
    });
    return (
      <div
        ref={ref}
        data-slot="outline-list"
        className={cn('flex min-h-0 min-w-0 flex-col', className)}
        {...rest}
      >
        {rows.length === 0 ? (
          <div className="p-3.5 text-sm text-[color:var(--oui-panel-meta-fg)]">{empty}</div>
        ) : (
          <List
            ref={list}
            aria-label={rest['aria-label'] ?? labels.list}
            onKeyDown={roving.onKeyDown}
            onFocus={roving.onFocus}
            className="m-0 flex min-h-0 flex-1 list-none flex-col gap-0.5 divide-y-0 overflow-auto rounded-none border-0 bg-transparent p-2"
          >
            {rows.map(({ item, number }) => {
              const state: OutlineRowState = {
                number,
                current: item.id === chosen,
                live: item.state === 'live',
              };
              const select = () => {
                setChosen(item.id);
                onValueChange?.(item);
              };
              return (
                <ListItem key={item.id} className="m-0 p-0">
                  {renderItem ? (
                    renderItem(item, state, select)
                  ) : (
                    <OutlineListItem
                      item={item}
                      {...state}
                      labels={labels}
                      {...(onValueChange ? { onSelect: select } : {})}
                    />
                  )}
                </ListItem>
              );
            })}
          </List>
        )}
      </div>
    );
  },
);
OutlineListImpl.displayName = 'OutlineList';

/** Generic over the item type: an extended item reaches `onValueChange` and `renderItem` by reference. */
export const OutlineList = OutlineListImpl as unknown as <T extends OutlineItem = OutlineItem>(
  props: OutlineListProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null;
