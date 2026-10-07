import * as React from 'react';

/** The nearest ancestor that scrolls vertically, or `null` when only the document scrolls. */
export const scrollParentOf = (node: HTMLElement): HTMLElement | null => {
  for (let parent = node.parentElement; parent; parent = parent.parentElement) {
    const overflow = getComputedStyle(parent).overflowY;
    if (overflow === 'auto' || overflow === 'scroll') return parent;
  }
  return null;
};

/** The scroll geometry `offsetFromBottom` and `restoreFromBottom` use; any scroll container satisfies it. */
export interface ScrollBox {
  scrollHeight: number;
  scrollTop: number;
  clientHeight: number;
}

/** Distance in px between the bottom of the viewport and the end of the content. */
export const offsetFromBottom = (box: ScrollBox): number => box.scrollHeight - box.scrollTop - box.clientHeight;

/** Scrolls so the viewport sits `offset` px above the end of the content again (after content was added above it). */
export const restoreFromBottom = (box: ScrollBox, offset: number): void => {
  box.scrollTop = box.scrollHeight - box.clientHeight - offset;
};

/** Index of the first item to draw when `size` newest items are wanted and nothing is pinned. */
export const defaultWindowStart = (length: number, size: number): number => Math.max(0, length - Math.max(1, Math.floor(size)));

export interface HistoryWindowOptions {
  /** How many of the newest items to draw at first. `undefined` or `Infinity`: all of them (no windowing). */
  size?: number;
  /** How many more earlier items each `showEarlier` reveals. Default: `size`. */
  step?: number;
}

export interface HistoryWindow<T> {
  /** The items to draw: a contiguous run ending at the newest item. */
  items: T[];
  /** Index in the full list of `items[0]`: add it to a visible index to get the real one. */
  start: number;
  /** How many earlier items are not drawn. */
  hidden: number;
  /** Draw `step` more earlier items. Pass the element whose scroll offset from the bottom must stay put; it is restored once the items are in the DOM. */
  showEarlier: (container?: HTMLElement | null) => void;
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

/**
 * Draws only the newest `size` items of a long history and reveals `step` more on demand, keeping what the person is reading
 * where it is. The window is pinned to the id of its first item, so a new item at the end grows the window instead of pushing the
 * oldest drawn item out; switching to a list that no longer holds that id starts a fresh window. `showEarlier(container)`
 * remembers the scroll offset from the bottom of the scroll parent of `container` and restores it right after the earlier items
 * are laid out, so the visible content does not jump.
 *
 * @example
 * const view = useHistoryWindow(turns, (turn) => turn.id, { size: 40 });
 * view.items.map(draw); {view.hidden > 0 && <button onClick={(e) => view.showEarlier(e.currentTarget)}>Earlier</button>}
 */
export function useHistoryWindow<T>(items: readonly T[], getId: (item: T) => string, { size, step }: HistoryWindowOptions = {}): HistoryWindow<T> {
  const windowed = size !== undefined && Number.isFinite(size);
  const [pin, setPin] = React.useState<string | null>(null);
  const latestId = React.useRef(getId);
  latestId.current = getId;

  // [STATE] The first drawn item: the pinned one while it still exists, otherwise the newest `size` items.
  const pinned = pin === null ? -1 : items.findIndex((item) => getId(item) === pin);
  const start = !windowed ? 0 : pinned >= 0 ? pinned : defaultWindowStart(items.length, size);
  const firstId = items.length > 0 ? getId(items[start]) : null;

  // Pin the window to its first item once, so appended items extend it. A list without the pin (another conversation) re-pins.
  React.useEffect(() => {
    if (windowed && firstId !== pin) setPin(firstId);
  }, [windowed, firstId, pin]);

  const restore = React.useRef<{ box: HTMLElement; offset: number } | null>(null);
  useIsomorphicLayoutEffect(() => {
    const pending = restore.current;
    if (!pending) return;
    restore.current = null;
    restoreFromBottom(pending.box, pending.offset);
  }, [start]);

  const latest = React.useRef({ items, start, size, step });
  latest.current = { items, start, size, step };
  const showEarlier = React.useCallback((container?: HTMLElement | null) => {
    const { items: all, start: from, size: base, step: more } = latest.current;
    if (from <= 0 || base === undefined) return;
    const box = container ? scrollParentOf(container) : null;
    restore.current = box ? { box, offset: offsetFromBottom(box) } : null;
    const next = Math.max(0, from - Math.max(1, Math.floor(more ?? base)));
    setPin(latestId.current(all[next]));
  }, []);

  const visible = React.useMemo(() => (start === 0 ? (items as T[]) : items.slice(start)), [items, start]);
  return { items: visible, start, hidden: start, showEarlier };
}
