import * as React from 'react';

/**
 * State that is either controlled (`value` given) or kept inside the component (`defaultValue`).
 * `onChange` fires in both modes. Used by the disclosure-style message parts (open / closed, one open source).
 */
export function useControllableState<T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void): [T, (next: T) => void] {
  const [inner, setInner] = React.useState<T>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value as T) : inner;
  const set = React.useCallback(
    (next: T) => {
      if (!controlled) setInner(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );
  return [current, set];
}
