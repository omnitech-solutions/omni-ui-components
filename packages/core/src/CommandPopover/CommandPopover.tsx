import * as React from 'react';

import { cn } from 'lib/utils';
import { useStableId } from '../lib';
import { useControllableState } from '../lib/use-controllable-state';
import { DEFAULT_COMMAND_POPOVER_LABELS, type CommandItem, type CommandPopoverProps } from './CommandPopover.types';
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
      labels: labelsProp,
      className,
      ...rest
    }: CommandPopoverProps<T>,
    ref: React.ForwardedRef<HTMLDivElement>,
  ) {
    const generated = useStableId('oui-command');
    const id = idProp ?? generated;
    const labels = { ...DEFAULT_COMMAND_POPOVER_LABELS, ...labelsProp };
    const [activeIndex, setActive] = useControllableState<number>(activeProp, defaultActiveIndex, onActiveChange);
    const root = React.useRef<HTMLDivElement | null>(null);
    // [SAFETY] A press outside asks to close; the textarea's own presses are outside too, so the host decides.
    React.useEffect(() => {
      if (!onClose) return;
      const away = (event: MouseEvent) => {
        if (root.current && !root.current.contains(event.target as Node)) onClose();
      };
      document.addEventListener('mousedown', away);
      return () => document.removeEventListener('mousedown', away);
    }, [onClose]);
    const active = React.useRef<HTMLDivElement | null>(null);
    React.useEffect(() => {
      active.current?.scrollIntoView?.({ block: 'nearest' });
    }, [activeIndex, items]);

    if (hideWhenEmpty && items.length === 0 && !loading) return null;
    return (
      <div ref={(node) => { root.current = node; if (typeof ref === 'function') ref(node); else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node; }} onKeyDown={(event) => { if (event.key === 'Escape') onClose?.(); }} data-slot="command-popover" data-placement={placement} className={cn(commandPopoverVariants({ placement }), className)} {...rest}>
        {title ? <div className={commandPopoverTitleClasses}>{title}</div> : null}
        <div id={id} role="listbox" aria-label={label} aria-busy={loading || undefined} className={commandPopoverListClasses}>
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
              {item.description ? <span className={commandPopoverDescriptionClasses}>{item.description}</span> : null}
            </div>
          ))}
          {items.length === 0 ? <div className={commandPopoverEmptyClasses}>{loading ? labels.loading : labels.empty}</div> : null}
        </div>
        {hint ? <div className={commandPopoverHintClasses}>{hint}</div> : null}
      </div>
    );
}

export const CommandPopover = React.forwardRef(CommandPopoverInner) as <T extends CommandItem = CommandItem>(
  props: CommandPopoverProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;
(CommandPopover as { displayName?: string }).displayName = 'CommandPopover';
