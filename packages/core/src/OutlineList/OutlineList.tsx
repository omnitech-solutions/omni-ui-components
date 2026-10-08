import { cn } from 'lib/utils';
import * as React from 'react';
import { useControllableState } from '../lib/use-controllable-state';
import type { OutlineItem, OutlineListLabels, OutlineListProps } from './OutlineList.types';

/** English strings of {@link OutlineList}. */
export const DEFAULT_OUTLINE_LIST_LABELS: OutlineListLabels = {
  list: 'Outline',
  live: 'live',
};

/**
 * Omni OutlineList: a numbered list of things to jump to (the questions of a call, the steps of a run). Each row
 * is one button with a label that wraps and a quiet meta line under it. The chosen row is marked with a bar; the
 * `live` row is green, so "what is happening now" and "what I am reading" never look alike. Arrow keys move
 * between rows, Home and End go to the ends.
 *
 * Slots: `data-slot="outline-list" | "outline-list-header" | "outline-list-row" | "outline-list-number" |
 * "outline-list-label" | "outline-list-meta"`.
 *
 * @example
 * <OutlineList title="Questions" items={questions} value={shown} onValueChange={(item) => show(item.id)} order="reversed" />
 */
const OutlineListImpl = React.forwardRef<HTMLDivElement, OutlineListProps>(
  (
    {
      items,
      value,
      defaultValue = null,
      onValueChange,
      order = 'as-given',
      title,
      hint,
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
    const focusRow = (index: number) =>
      list.current?.querySelectorAll<HTMLElement>('[data-slot="outline-list-row"]')[index]?.focus();
    return (
      <div
        ref={ref}
        data-slot="outline-list"
        className={cn('flex min-h-0 min-w-0 flex-col', className)}
        {...rest}
      >
        {(title || hint) && (
          <div
            data-slot="outline-list-header"
            className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-[color:var(--oui-panel-divider)] px-3.5"
          >
            <span className="text-[11px] font-semibold tracking-[0.08em] text-[color:var(--oui-panel-meta-fg)] uppercase">
              {title}
            </span>
            {hint && <span className="text-xs text-[color:var(--oui-panel-meta-fg)]">{hint}</span>}
          </div>
        )}
        {rows.length === 0 ? (
          <div className="p-3.5 text-sm text-[color:var(--oui-panel-meta-fg)]">{empty}</div>
        ) : (
          <ul
            ref={list}
            aria-label={typeof title === 'string' ? title : labels.list}
            className="m-0 flex min-h-0 flex-1 list-none flex-col gap-0.5 overflow-auto p-2"
          >
            {rows.map(({ item, number }, index) => {
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
                      aria-label={name}
                      title={name}
                      className={cn(
                        rowClass,
                        'cursor-pointer hover:bg-[color:color-mix(in_srgb,var(--oui-foreground)_6%,transparent)] focus-visible:ring-2 focus-visible:ring-ring/50',
                      )}
                      onClick={() => {
                        setChosen(item.id);
                        onValueChange(item);
                      }}
                      onKeyDown={(event) => {
                        const to =
                          event.key === 'ArrowDown'
                            ? index + 1
                            : event.key === 'ArrowUp'
                              ? index - 1
                              : event.key === 'Home'
                                ? 0
                                : event.key === 'End'
                                  ? rows.length - 1
                                  : null;
                        if (to === null || to < 0 || to >= rows.length) return;
                        event.preventDefault();
                        focusRow(to);
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
