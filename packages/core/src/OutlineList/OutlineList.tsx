import { cn } from 'lib/utils';
import * as React from 'react';
import { useControllableState } from '../lib/use-controllable-state';
import { useRovingTabindex } from '../lib/use-roving-tabindex';
import type { OutlineItem, OutlineListLabels, OutlineListProps } from './OutlineList.types';

/** English strings of {@link OutlineList}. */
export const DEFAULT_OUTLINE_LIST_LABELS: OutlineListLabels = {
  list: 'Outline',
  live: 'live',
};

/**
 * Omni OutlineList: a numbered list of things to jump to (the questions of a call, the steps of a run). Each row
 * is one button with a label that wraps and a quiet meta line under it. The chosen row is marked with a bar; the
 * `live` row is green, so "what is happening now" and "what I am reading" never look alike.
 *
 * It is the rows only. Its heading, count and scrolling come from the `Panel` it is placed in, and its keyboard
 * movement (arrow keys, Home, End, one tab stop) from the library's roving tabindex, as in `ConversationList`.
 *
 * Slots: `data-slot="outline-list" | "outline-list-row" | "outline-list-number" | "outline-list-label" |
 * "outline-list-meta"`.
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
          <ul
            ref={list}
            aria-label={rest['aria-label'] ?? labels.list}
            onKeyDown={roving.onKeyDown}
            onFocus={roving.onFocus}
            className="m-0 flex min-h-0 flex-1 list-none flex-col gap-0.5 overflow-auto p-2"
          >
            {rows.map(({ item, number }) => {
              const live = item.state === 'live';
              const current = item.id === chosen;
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
                  <span className="flex min-w-0 flex-col gap-0.5">
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
              return (
                <li key={item.id} className="m-0 p-0">
                  {onValueChange ? (
                    <button
                      type="button"
                      data-slot="outline-list-row"
                      data-state={live ? 'live' : 'default'}
                      aria-current={current ? 'true' : undefined}
                      title={name}
                      className={cn(
                        rowClass,
                        'cursor-pointer hover:bg-[color:color-mix(in_srgb,var(--oui-foreground)_6%,transparent)] focus-visible:ring-2 focus-visible:ring-ring/50',
                      )}
                      onClick={() => {
                        setChosen(item.id);
                        onValueChange(item);
                      }}
                    >
                      {body}
                    </button>
                  ) : (
                    <div
                      data-slot="outline-list-row"
                      data-state={live ? 'live' : 'default'}
                      className={rowClass}
                    >
                      {body}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  },
);
OutlineListImpl.displayName = 'OutlineList';

/** Generic over the item type: an extended item reaches `onValueChange` by reference. */
export const OutlineList = OutlineListImpl as unknown as <T extends OutlineItem = OutlineItem>(
  props: OutlineListProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null;
