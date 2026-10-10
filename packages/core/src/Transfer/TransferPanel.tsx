import { cn } from 'lib/utils';
import { Check } from 'lucide-react';
import * as React from 'react';
import { IconButton } from '../IconButton';
import { InputPrimitive } from '../Input';
import type { TransferItem, TransferLabels } from './Transfer.types';

export interface TransferPanelProps {
  side: 'source' | 'target';
  /** Id of the listbox; the title and the options derive theirs from it. */
  listId: string;
  listRef?: React.Ref<HTMLDivElement>;
  title: string;
  searchLabel: string;
  items: TransferItem[];
  selected: string[];
  onSelectedChange: (next: string[]) => void;
  /** Enter on the list: move the selected items across. */
  onMove: () => void;
  /** Set on the target of a one-way transfer: rows have no selection, each gets a remove button. */
  onRemove?: (item: TransferItem) => void;
  filterOption?: (query: string, item: TransferItem) => boolean;
  searchable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  listHeight: number | string;
  describedBy?: string;
  removeIcon: React.ReactNode;
  labels: TransferLabels;
  testId?: string;
}

const plain = (node: React.ReactNode) =>
  typeof node === 'string' || typeof node === 'number' ? String(node) : '';

const matches = (query: string, item: TransferItem) =>
  `${plain(item.title)} ${plain(item.description)} ${item.key}`.toLowerCase().includes(query);

/** One side of a Transfer: header (title and count), optional filter, and the listbox. Internal to the folder. */
export function TransferPanel({
  side,
  listId,
  listRef,
  title,
  searchLabel,
  items,
  selected,
  onSelectedChange,
  onMove,
  onRemove,
  filterOption,
  searchable,
  disabled,
  readOnly,
  required,
  invalid,
  listHeight,
  describedBy,
  removeIcon,
  labels,
  testId,
}: TransferPanelProps) {
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState<string>();
  const scroller = React.useRef<HTMLDivElement>(null);
  const selectable = !onRemove;
  const locked = Boolean(disabled) || Boolean(readOnly);
  const titleId = `${listId}-title`;
  const optionId = (key: string) => `${listId}-option-${key}`;

  // Rows the filter keeps; the active row moves only over the ones that can be acted on.
  const needle = query.trim().toLowerCase();
  const visible = !needle
    ? items
    : items.filter((item) => (filterOption ? filterOption(query, item) : matches(needle, item)));
  const reachable = visible.filter((item) => !item.disabled);
  const activeItem = reachable.find((item) => item.key === active) ?? reachable[0];
  const activeKey = activeItem?.key;

  // Keep the active row in view while the list is driven by keyboard.
  React.useEffect(() => {
    const root = scroller.current;
    if (!activeKey || !root?.contains(document.activeElement)) return;
    document
      .getElementById(`${listId}-option-${activeKey}`)
      ?.scrollIntoView?.({ block: 'nearest' });
  }, [activeKey, listId]);

  const toggle = (key: string) =>
    onSelectedChange(
      selected.includes(key) ? selected.filter((each) => each !== key) : [...selected, key],
    );

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const at = reachable.findIndex((item) => item.key === activeKey);
    const last = reachable.length - 1;
    const jump: Record<string, number> = {
      ArrowDown: Math.min(at + 1, last),
      ArrowUp: Math.max(at - 1, 0),
      Home: 0,
      End: last,
    };
    // Moving the active row is allowed read-only: the list can still be read through.
    if (event.key in jump) {
      event.preventDefault();
      setActive(reachable[jump[event.key] as number]?.key);
      return;
    }
    if (readOnly) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      if (selectable) onSelectedChange(reachable.map((item) => item.key));
    } else if (event.key === ' ') {
      event.preventDefault();
      if (selectable && activeKey) toggle(activeKey);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      onMove();
    } else if ((event.key === 'Delete' || event.key === 'Backspace') && onRemove && activeItem) {
      event.preventDefault();
      onRemove(activeItem);
    }
  };

  const onRowClick = (item: TransferItem) => {
    if (locked || item.disabled) return;
    setActive(item.key);
    if (selectable) toggle(item.key);
  };

  // One-way target: the listbox and the remove buttons are two columns of one grid that share its rows, so the
  // buttons sit beside their rows without being inside an option.
  const rows = { gridRow: `1 / span ${Math.max(visible.length, 1)}` };
  const showRemove = Boolean(onRemove) && !readOnly;

  return (
    <div
      data-slot="transfer-panel"
      data-side={side}
      data-invalid={invalid || undefined}
      data-testid={testId ? `${testId}-${side}-panel` : undefined}
      className={cn(
        'flex min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--oui-radius-field)] border',
        'border-[var(--oui-border-field)] bg-[var(--oui-surface-field)]',
        'has-[[role=listbox]:focus-visible]:border-[var(--oui-border-interactive)]',
        'data-[invalid]:border-[var(--oui-border-invalid)]',
        disabled && 'bg-[var(--oui-surface-field-disabled)] opacity-50',
      )}
    >
      <div
        data-slot="transfer-header"
        className="flex items-center justify-between gap-2 border-b border-[var(--oui-border-field)] px-3 py-2"
      >
        <span
          id={titleId}
          data-slot="transfer-title"
          className="truncate text-sm font-semibold text-[var(--oui-foreground)]"
        >
          {title}
        </span>
        <span
          data-slot="transfer-count"
          className="shrink-0 text-xs text-[var(--oui-foreground-muted)]"
        >
          {selectable
            ? labels.selectedCount(selected.length, items.length)
            : labels.itemCount(items.length)}
        </span>
      </div>
      {searchable ? (
        <div data-slot="transfer-search" className="border-b border-[var(--oui-border-field)] p-2">
          <InputPrimitive
            type="search"
            inputSize="sm"
            aria-label={searchLabel}
            placeholder={labels.searchPlaceholder}
            value={query}
            onChange={setQuery}
            disabled={disabled}
            data-testid={testId ? `${testId}-${side}-search` : undefined}
          />
        </div>
      ) : null}
      <div
        ref={scroller}
        data-slot="transfer-scroll"
        style={{ height: listHeight }}
        className={cn(
          'relative overflow-y-auto',
          onRemove && 'grid grid-cols-[minmax(0,1fr)_auto] content-start',
        )}
      >
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          // A disabled list keeps its tab stop: it may scroll, and a keyboard must reach what a pointer can read.
          tabIndex={0}
          aria-multiselectable={selectable || undefined}
          aria-labelledby={titleId}
          aria-describedby={describedBy}
          aria-activedescendant={activeKey && !disabled ? optionId(activeKey) : undefined}
          aria-disabled={disabled || undefined}
          aria-readonly={readOnly || undefined}
          aria-required={required || undefined}
          aria-invalid={invalid || undefined}
          data-slot="transfer-list"
          data-testid={testId ? `${testId}-${side}` : undefined}
          onKeyDown={onKeyDown}
          style={onRemove ? rows : undefined}
          className={cn(
            'group/list outline-none',
            onRemove ? 'col-start-1 grid min-h-9 grid-rows-subgrid' : 'min-h-full',
          )}
        >
          {visible.map((item) => {
            const isSelected = selected.includes(item.key);
            return (
              // biome-ignore lint/a11y/useKeyWithClickEvents: the keyboard is handled once, on the listbox
              // biome-ignore lint/a11y/useFocusableInteractive: the listbox keeps focus and points at the row with aria-activedescendant
              <div
                key={item.key}
                id={optionId(item.key)}
                role="option"
                aria-selected={selectable ? isSelected : undefined}
                aria-disabled={item.disabled || disabled || undefined}
                data-slot="transfer-option"
                data-active={item.key === activeKey}
                onClick={() => onRowClick(item)}
                className={cn(
                  'flex cursor-pointer items-start gap-2 px-3 py-1.5 text-sm text-[var(--oui-foreground)]',
                  '-outline-offset-2 outline-[var(--oui-border-interactive)]',
                  'group-focus-visible/list:data-[active=true]:outline-2',
                  'hover:bg-[var(--oui-tone-neutral-bg)] aria-selected:bg-[var(--oui-tone-accent-bg)]',
                  'aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-transparent',
                  locked && 'cursor-default',
                )}
              >
                {selectable ? (
                  <span
                    aria-hidden="true"
                    data-slot="transfer-check"
                    className={cn(
                      'mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border',
                      isSelected
                        ? 'border-[var(--oui-tone-accent-solid-bg)] bg-[var(--oui-tone-accent-solid-bg)] text-[var(--oui-tone-accent-solid-fg)]'
                        : 'border-[var(--oui-foreground-muted)]',
                    )}
                  >
                    {isSelected ? <Check className="size-3" strokeWidth={3} /> : null}
                  </span>
                ) : null}
                <span className="flex min-w-0 flex-col">
                  <span data-slot="transfer-option-title">{item.title}</span>
                  {item.description ? (
                    <span
                      data-slot="transfer-option-description"
                      className="text-xs text-[var(--oui-foreground-muted)]"
                    >
                      {item.description}
                    </span>
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
        {showRemove && visible.length > 0 ? (
          <div
            data-slot="transfer-remove-column"
            style={rows}
            className="col-start-2 grid grid-rows-subgrid"
          >
            {visible.map((item) => (
              <div key={item.key} className="flex items-center pr-1">
                <IconButton
                  variant="ghost"
                  iconSize="sm"
                  icon={removeIcon}
                  label={labels.remove(item)}
                  disabled={disabled || item.disabled}
                  onClick={() => onRemove?.(item)}
                />
              </div>
            ))}
          </div>
        ) : null}
        {visible.length === 0 ? (
          <p
            data-slot="transfer-empty"
            className="pointer-events-none absolute inset-0 flex items-center justify-center px-3 text-center text-xs text-[var(--oui-foreground-muted)]"
          >
            {items.length === 0 ? labels.empty : labels.noMatches}
          </p>
        ) : null}
      </div>
    </div>
  );
}
