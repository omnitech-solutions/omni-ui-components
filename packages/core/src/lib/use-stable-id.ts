import * as React from 'react';

let counter = 0;

/**
 * Stable component-instance id usable for `htmlFor` and `aria-describedby`
 * wiring. SSR-safe because each render reuses the ref-cached value.
 *
 * @example
 * const id = useStableId('oui-input');
 * <label htmlFor={id}>…</label>
 * <input id={id} />
 */
export const useStableId = (prefix = 'oui') => {
  const ref = React.useRef<string | null>(null);
  if (ref.current === null) {
    counter += 1;
    ref.current = `${prefix}-${counter}`;
  }
  return ref.current;
};
