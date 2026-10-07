import * as React from 'react';

export type RovingOrientation = 'horizontal' | 'vertical';

export interface RovingTabindexOptions {
  /** The focusable items inside the root, in DOM order. Disabled ones must be left out. */
  getItems: (root: HTMLElement) => HTMLElement[];
  /** Arrow keys that move: Left/Right (`horizontal`) or Up/Down (`vertical`). Home and End always jump to the ends. */
  orientation?: RovingOrientation;
  /** Wrap from the last item to the first (and back). Default true. */
  loop?: boolean;
  /** Custom move for layouts the orientation cannot express. Return the item to focus, or undefined to ignore the key. */
  navigate?: (key: string, items: HTMLElement[], index: number) => HTMLElement | undefined;
  /** Which item holds the single tab stop when focus is outside the group. Default: the selected one, else the first. */
  preferred?: (items: HTMLElement[]) => HTMLElement | undefined;
}

const isSelected = (el: HTMLElement) =>
  el.getAttribute('aria-pressed') === 'true' ||
  el.getAttribute('aria-current') === 'true' ||
  el.getAttribute('aria-checked') === 'true';

/**
 * Roving tabindex for a group: exactly one item has `tabindex="0"` (Tab enters and leaves the group there), the
 * rest `-1`. Arrow keys, Home and End move focus and the tab stop together. The stop follows focus, so Tab back into
 * the group lands on the item you left. It manages the DOM `tabindex` attribute after each render, so the items need
 * no props of their own.
 *
 * @example
 * const { onKeyDown, onFocus } = useRovingTabindex(ref, { getItems: (root) => [...root.querySelectorAll('button:not(:disabled)')] });
 */
export function useRovingTabindex(
  root: React.RefObject<HTMLElement | null>,
  options: RovingTabindexOptions,
) {
  const opts = React.useRef(options);
  opts.current = options;
  const current = React.useRef<HTMLElement | null>(null);

  const sync = React.useCallback(() => {
    const el = root.current;
    if (!el) return;
    const items = opts.current.getItems(el);
    if (items.length === 0) return;
    if (!current.current || !items.includes(current.current)) {
      current.current =
        opts.current.preferred?.(items) ?? items.find(isSelected) ?? items[0] ?? null;
    }
    for (const item of items) item.setAttribute('tabindex', item === current.current ? '0' : '-1');
  }, [root]);

  // After every render: items come and go (a disabled action, a filtered list), so the stop is re-validated.
  React.useLayoutEffect(sync);

  const onFocus = React.useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      const el = root.current;
      if (!el) return;
      const target = event.target as HTMLElement;
      if (!opts.current.getItems(el).includes(target)) return;
      current.current = target;
      sync();
    },
    [root, sync],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const el = root.current;
      if (!el) return;
      const { orientation = 'horizontal', loop = true, navigate } = opts.current;
      const items = opts.current.getItems(el);
      const at = items.indexOf(event.target as HTMLElement);
      if (at === -1) return;
      let next: HTMLElement | undefined;
      if (navigate) {
        next = navigate(event.key, items, at);
      } else {
        const [back, forward] =
          orientation === 'horizontal' ? ['ArrowLeft', 'ArrowRight'] : ['ArrowUp', 'ArrowDown'];
        if (event.key === 'Home') next = items[0];
        else if (event.key === 'End') next = items[items.length - 1];
        else if (event.key === forward)
          next = items[loop ? (at + 1) % items.length : Math.min(at + 1, items.length - 1)];
        else if (event.key === back)
          next = items[loop ? (at - 1 + items.length) % items.length : Math.max(at - 1, 0)];
      }
      if (!next) return;
      event.preventDefault();
      next.focus();
    },
    [root],
  );

  return { onKeyDown, onFocus };
}
