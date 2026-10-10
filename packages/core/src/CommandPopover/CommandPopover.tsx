import { cn } from 'lib/utils';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { resolvePortalContainer, surfaceProps } from '../internal/support/PortalContainer';
import { useStableId } from '../lib';
import { useControllableState } from '../lib/use-controllable-state';
import {
  type CommandItem,
  type CommandPopoverProps,
  DEFAULT_COMMAND_POPOVER_LABELS,
} from './CommandPopover.types';
import {
  commandPopoverDescriptionClasses,
  commandPopoverEmptyClasses,
  commandPopoverGroupLabelClasses,
  commandPopoverHintClasses,
  commandPopoverKeyClasses,
  commandPopoverListClasses,
  commandPopoverOptionClasses,
  commandPopoverSearchClasses,
  commandPopoverSearchInputClasses,
  commandPopoverShortcutClasses,
  commandPopoverTitleClasses,
  commandPopoverVariants,
} from './CommandPopover.variants';

/**
 * The listbox that a `/` or `@` typed in a composer opens. Presentational: it draws `items`, highlights
 * `activeIndex` (`aria-selected`) and reports hover (`onActiveChange`) and click (`onSelect`). Focus never leaves the
 * textarea: option `mousedown` is prevented, and the keys are handled by {@link useCommandTrigger} (ArrowUp/Down, Enter or
 * Tab, Escape). The active row scrolls into view. Strings come from `labels`, `title` and `hint`; icons are nodes.
 * Slots: `data-slot="command-popover" | "command-popover-option"`.
 *
 * @example
 * <CommandPopover label="Commands" title="Commands" labelPrefix="/" hint={DEFAULT_COMMAND_HINT} items={items} activeIndex={i} onActiveChange={setI} onSelect={run} />
 */
const labelContains = (item: CommandItem, query: string) =>
  item.label.toLowerCase().includes(query.trim().toLowerCase());

function CommandPopoverInner<T extends CommandItem = CommandItem>(
  {
    items: allItems,
    activeIndex: activeProp,
    defaultActiveIndex = 0,
    onActiveChange,
    onClose,
    onSelect,
    label,
    title,
    labelPrefix,
    hint,
    hideWhenEmpty = false,
    loading = false,
    id: idProp,
    placement = 'above',
    anchor,
    container,
    search,
    filter,
    style,
    labels: labelsProp,
    className,
    ...rest
  }: CommandPopoverProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const generated = useStableId('oui-command');
  const id = idProp ?? generated;
  const labels = { ...DEFAULT_COMMAND_POPOVER_LABELS, ...labelsProp };
  const [activeIndex, setActive] = useControllableState<number>(
    activeProp,
    defaultActiveIndex,
    onActiveChange,
  );
  // [STATE] With `search` the popover owns the query and shows the rows that pass `filter`.
  const [query, setQueryState] = useControllableState<string>(
    search?.value,
    search?.defaultValue ?? '',
    search?.onChange,
  );
  const items = React.useMemo<readonly T[]>(() => {
    if (!search || filter === false) return allItems;
    const passes = filter ?? labelContains;
    return allItems.filter((item) => passes(item, query));
  }, [allItems, search, filter, query]);
  // [DOMAIN] Rows are drawn group by group, groups in first-seen order; each row keeps its index in `items`.
  const sections = React.useMemo(() => {
    const found: { group: string | undefined; rows: { item: T; at: number }[] }[] = [];
    items.forEach((item, at) => {
      const section = found.find((entry) => entry.group === item.group);
      if (section) section.rows.push({ item, at });
      else found.push({ group: item.group, rows: [{ item, at }] });
    });
    return found;
  }, [items]);
  const order = sections.flatMap((section) => section.rows.map((row) => row.at));
  const move = (to: number) => {
    if (order.length > 0) setActive(order[(to + order.length) % order.length]);
  };
  const root = React.useRef<HTMLDivElement | null>(null);
  const list = React.useRef<HTMLDivElement | null>(null);
  // [SAFETY] A press outside asks to close. The trigger's own textarea (the anchor, and the composer around it) is inside.
  React.useEffect(() => {
    if (!onClose) return;
    const away = (event: MouseEvent) => {
      const target = event.target as Node;
      if (root.current?.contains(target)) return;
      const home = anchor?.closest('[data-slot="composer"]') ?? anchor;
      if (home?.contains(target)) return;
      onClose();
    };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [onClose, anchor]);

  // [STATE] Anchored mode: fixed position from the anchor's rect, kept current on scroll and resize.
  const [box, setBox] = React.useState<{
    left: number;
    width: number;
    top?: number;
    bottom?: number;
  } | null>(null);
  React.useLayoutEffect(() => {
    if (!anchor) return setBox(null);
    const measure = () => {
      const rect = anchor.getBoundingClientRect();
      setBox(
        placement !== 'below'
          ? { left: rect.left, width: rect.width, bottom: window.innerHeight - rect.top + 8 }
          : { left: rect.left, width: rect.width, top: rect.bottom + 8 },
      );
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [anchor, placement, items.length]);
  const active = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    // Only the list is scrolled: `scrollIntoView` would also move every scrolling ancestor, the page included.
    const option = active.current;
    const box = list.current;
    if (!option || !box || box.scrollHeight <= box.clientHeight) return;
    const listTop = box.getBoundingClientRect().top;
    const start = option.getBoundingClientRect().top - listTop + box.scrollTop - box.clientTop;
    const end = start + option.offsetHeight;
    if (start < box.scrollTop) box.scrollTop = start;
    else if (end > box.scrollTop + box.clientHeight) box.scrollTop = end - box.clientHeight;
  }, [activeIndex, items]);

  if (hideWhenEmpty && items.length === 0 && !loading) return null;
  const node = (
    <div
      ref={(element) => {
        root.current = element;
        if (typeof ref === 'function') ref(element);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose?.();
      }}
      data-slot="command-popover"
      data-placement={placement}
      data-portal={anchor ? 'true' : undefined}
      {...surfaceProps('command-popover')}
      className={cn(
        commandPopoverVariants({ placement }),
        anchor && 'fixed inset-x-auto z-50 mb-0 mt-0',
        className,
      )}
      style={
        anchor
          ? {
              ...box,
              bottom: placement !== 'below' ? box?.bottom : 'auto',
              top: placement === 'below' ? box?.top : 'auto',
              ...style,
            }
          : style
      }
      {...rest}
    >
      {title ? <div className={commandPopoverTitleClasses}>{title}</div> : null}
      {search ? (
        <div data-slot="command-popover-search" className={commandPopoverSearchClasses}>
          {search.icon ? (
            <span aria-hidden="true" className="inline-flex flex-none">
              {search.icon}
            </span>
          ) : null}
          <input
            type="text"
            role="combobox"
            aria-label={search.label}
            aria-controls={id}
            aria-expanded={items.length > 0}
            aria-autocomplete="list"
            aria-activedescendant={
              items.length > 0 && activeIndex < items.length
                ? `${id}-option-${activeIndex}`
                : undefined
            }
            autoComplete="off"
            spellCheck={false}
            placeholder={search.placeholder}
            value={query}
            className={commandPopoverSearchInputClasses}
            onChange={(event) => {
              setQueryState(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              const at = order.indexOf(activeIndex);
              if (event.key === 'ArrowDown') move(at + 1);
              else if (event.key === 'ArrowUp') move(at < 0 ? -1 : at - 1);
              else if (event.key === 'Home') move(0);
              else if (event.key === 'End') move(-1);
              else if (event.key === 'Enter') {
                const item = items[activeIndex];
                if (item) void onSelect(item, activeIndex);
              } else return;
              event.preventDefault();
            }}
          />
        </div>
      ) : null}
      <div
        ref={list}
        id={id}
        // A listbox must hold an option: with nothing to choose, the box is a status that says so.
        role={items.length === 0 ? 'status' : 'listbox'}
        aria-label={items.length === 0 ? undefined : label}
        aria-busy={loading || undefined}
        className={commandPopoverListClasses}
      >
        {sections.map((section) => {
          const rows = section.rows.map(({ item, at }) => (
            <div
              key={item.id}
              ref={at === activeIndex ? active : undefined}
              id={`${id}-option-${at}`}
              role="option"
              aria-selected={at === activeIndex}
              tabIndex={-1}
              data-slot="command-popover-option"
              className={commandPopoverOptionClasses}
              // Keeps the caret in the textarea: the click still fires.
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(at)}
              onClick={() => void onSelect(item, at)}
            >
              {item.icon ? (
                <span aria-hidden="true" className="inline-flex flex-none">
                  {item.icon}
                </span>
              ) : null}
              <span className={cn('min-w-0 truncate', labelPrefix && 'font-mono')}>
                {labelPrefix}
                {item.label}
              </span>
              {item.description ? (
                <span className={commandPopoverDescriptionClasses}>{item.description}</span>
              ) : null}
              {item.shortcut?.length ? (
                <span
                  data-slot="command-popover-shortcut"
                  className={commandPopoverShortcutClasses}
                >
                  {item.shortcut.map((key) => (
                    <kbd key={key} className={commandPopoverKeyClasses}>
                      {key}
                    </kbd>
                  ))}
                </span>
              ) : null}
            </div>
          ));
          if (section.group === undefined) return rows;
          const groupId = `${id}-group-${section.rows[0].at}`;
          return (
            // biome-ignore lint/a11y/useSemanticElements: a fieldset cannot be a child of a listbox; `group` can.
            <div key={`group:${section.group}`} role="group" aria-labelledby={groupId}>
              <div id={groupId} role="presentation" className={commandPopoverGroupLabelClasses}>
                {section.group}
              </div>
              {rows}
            </div>
          );
        })}
        {items.length === 0 ? (
          <div className={commandPopoverEmptyClasses}>
            {loading ? labels.loading : labels.empty}
          </div>
        ) : null}
      </div>
      {hint ? <div className={commandPopoverHintClasses}>{hint}</div> : null}
    </div>
  );
  return anchor ? createPortal(node, resolvePortalContainer(container) ?? document.body) : node;
}

export const CommandPopover = React.forwardRef(CommandPopoverInner) as <
  T extends CommandItem = CommandItem,
>(
  props: CommandPopoverProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;
(CommandPopover as { displayName?: string }).displayName = 'CommandPopover';
