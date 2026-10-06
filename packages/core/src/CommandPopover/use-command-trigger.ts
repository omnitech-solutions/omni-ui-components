import * as React from 'react';

import { useStableId } from '../lib';
import type { CommandItem, CommandPopoverProps, CommandTrigger, UseCommandTriggerOptions } from './CommandPopover.types';

const labelContains = (item: CommandItem, query: string) => item.label.toLowerCase().includes(query.toLowerCase());
const NO_ITEMS: readonly never[] = [];

/**
 * Popover state for slash and `@` triggers over a text draft. It finds the first trigger whose `pattern` matches the
 * draft, resolves its rows (a sync array filtered by the query, or `source(query)` sync or async with stale answers
 * dropped) and owns the highlighted index. Focus stays in the textarea: pass `onKeyDown` to its `onKeyDown` first and
 * skip your own handling when it returns `true` (ArrowUp/ArrowDown move, Enter or Tab pick, Escape closes until the
 * draft changes), and put `aria-activedescendant` on the textarea. Spread `popoverProps` on {@link CommandPopover}.
 *
 * @example
 * const command = useCommandTrigger({ value, triggers: [slashTrigger({ source: commands, onPick, popover: { label: 'Commands' } })] });
 * <textarea onKeyDown={(e) => { if (command.onKeyDown(e)) return; … }} aria-activedescendant={command.activeDescendant} />
 * {command.open && <CommandPopover {...command.popoverProps} />}
 */
export function useCommandTrigger<T extends CommandItem = CommandItem>({ value, triggers, disabled = false, onAfterPick, onClose, id: idProp }: UseCommandTriggerOptions<T>) {
  const generatedId = useStableId('oui-command');
  const listboxId = idProp ?? generatedId;
  const [index, setIndex] = React.useState(0);
  // The draft the person dismissed with Escape: the popover stays closed until the draft changes.
  const [dismissed, setDismissed] = React.useState<string | null>(null);

  const matched = React.useMemo(() => {
    if (disabled) return null;
    for (const trigger of triggers) {
      const match = trigger.pattern.exec(value);
      if (match) return { trigger, match, query: match[1] ?? '' };
    }
    return null;
  }, [disabled, triggers, value]);

  const trigger: CommandTrigger<T> | null = matched?.trigger ?? null;
  const query = matched?.query ?? '';

  // Rows: an array filters synchronously; a function may answer later.
  const [asyncState, setAsyncState] = React.useState<{ key: string; items: readonly T[] } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const source = trigger?.source;
  const syncItems = React.useMemo(() => {
    if (!trigger || typeof source === 'function' || !source) return null;
    const keep = trigger.filter ?? labelContains;
    return source.filter((item) => keep(item, query));
  }, [trigger, source, query]);
  const asyncKey = trigger && typeof source === 'function' ? `${trigger.id}:${query}` : '';
  React.useEffect(() => {
    if (!trigger || typeof source !== 'function') return;
    let cancelled = false;
    const result = source(query);
    if (Array.isArray(result)) {
      setAsyncState({ key: asyncKey, items: result });
      setLoading(false);
      return;
    }
    setLoading(true);
    void Promise.resolve(result).then(
      (items) => {
        if (cancelled) return;
        setAsyncState({ key: asyncKey, items });
        setLoading(false);
      },
      () => {
        if (cancelled) return;
        setAsyncState({ key: asyncKey, items: NO_ITEMS });
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
    // `source` identity changes every render for inline functions; the query and trigger id are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger?.id, query, typeof source === 'function' ? 'fn' : 'arr']);

  const items: readonly T[] = syncItems ?? asyncState?.items ?? NO_ITEMS;
  const open = Boolean(trigger) && dismissed !== value && !(trigger?.popover.hideWhenEmpty && items.length === 0 && !loading);

  // A new query or trigger starts at the first row.
  React.useEffect(() => setIndex(0), [trigger?.id, query]);
  // A changed draft ends a dismissal.
  React.useEffect(() => {
    if (dismissed !== null && dismissed !== value) setDismissed(null);
  }, [dismissed, value]);

  const active = Math.min(index, Math.max(0, items.length - 1));

  const pick = React.useCallback(
    (at: number) => {
      const item = items[at];
      if (!trigger || !matched || !item) return;
      void trigger.onPick(item, { draft: value, query, match: matched.match });
      setDismissed(value);
      onAfterPick?.();
    },
    [items, trigger, matched, value, query, onAfterPick],
  );

  const close = React.useCallback(() => {
    setDismissed(value);
    onClose?.();
  }, [value, onClose]);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent): boolean => {
      if (!open) return false;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setIndex(Math.min(items.length - 1, active + 1));
        return true;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setIndex(Math.max(0, active - 1));
        return true;
      }
      if ((event.key === 'Enter' || event.key === 'Tab') && items.length > 0) {
        // [GUARD] IME composition owns Enter.
        if (event.nativeEvent.isComposing) return false;
        event.preventDefault();
        pick(active);
        return true;
      }
      if (event.key === 'Escape') {
        // Closing the popover is Escape's whole job here: do not let it also stop a run.
        event.preventDefault();
        event.stopPropagation();
        close();
        return true;
      }
      return false;
    },
    [open, items.length, active, pick, close],
  );

  const popoverProps: CommandPopoverProps<T> | null = trigger
    ? {
        ...trigger.popover,
        items,
        activeIndex: active,
        onActiveChange: setIndex,
        onClose: close,
        onSelect: (_item, at) => pick(at),
        loading,
        id: listboxId,
      }
    : null;

  return {
    open,
    trigger,
    query,
    items,
    activeIndex: active,
    setActiveIndex: setIndex,
    pick,
    close,
    onKeyDown,
    listboxId,
    /** For `aria-activedescendant` on the textarea while the popover is open. */
    activeDescendant: open && items.length > 0 ? `${listboxId}-option-${active}` : undefined,
    popoverProps: popoverProps as CommandPopoverProps<T>,
  };
}
