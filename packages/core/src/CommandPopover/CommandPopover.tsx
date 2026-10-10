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
  commandPopoverHintClasses,
  commandPopoverListClasses,
  commandPopoverOptionClasses,
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
function CommandPopoverInner<T extends CommandItem = CommandItem>(
  {
    items,
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
  const root = React.useRef<HTMLDivElement | null>(null);
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
        placement === 'above'
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
    const list = option?.parentElement;
    if (!option || !list || list.scrollHeight <= list.clientHeight) return;
    const listTop = list.getBoundingClientRect().top;
    const start = option.getBoundingClientRect().top - listTop + list.scrollTop - list.clientTop;
    const end = start + option.offsetHeight;
    if (start < list.scrollTop) list.scrollTop = start;
    else if (end > list.scrollTop + list.clientHeight) list.scrollTop = end - list.clientHeight;
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
              bottom: placement === 'above' ? box?.bottom : 'auto',
              top: placement === 'below' ? box?.top : 'auto',
              ...style,
            }
          : style
      }
      {...rest}
    >
      {title ? <div className={commandPopoverTitleClasses}>{title}</div> : null}
      <div
        id={id}
        role="listbox"
        aria-label={label}
        aria-busy={loading || undefined}
        className={commandPopoverListClasses}
      >
        {items.map((item, at) => (
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
          </div>
        ))}
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
