import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';

export interface StableRjsfCallbacks<T = unknown> {
  onChange: (next: T) => void;
  onBlur: (e: React.FocusEvent<HTMLElement>) => void;
  onFocus: (e: React.FocusEvent<HTMLElement>) => void;
}

// Wraps RJSF widget callbacks so the returned handlers are stable across
// renders. RJSF re-creates onChange/onBlur/onFocus on every render which
// invalidates downstream memoization; this hook keeps the latest props in a
// ref and exposes constant-identity callbacks.
export function useStableRjsfCallbacks<T = unknown>(
  props: Pick<WidgetProps, 'id' | 'onChange' | 'onBlur' | 'onFocus' | 'options'>,
  transform: (next: T, emptyValue: unknown) => unknown = (next, empty) => (next === '' ? (empty ?? '') : next),
): StableRjsfCallbacks<T> {
  const refs = React.useRef({
    onChange: props.onChange,
    onBlur: props.onBlur,
    onFocus: props.onFocus,
    emptyValue: props.options?.emptyValue,
    id: props.id,
  });
  React.useEffect(() => {
    refs.current = {
      onChange: props.onChange,
      onBlur: props.onBlur,
      onFocus: props.onFocus,
      emptyValue: props.options?.emptyValue,
      id: props.id,
    };
  });
  const onChange = React.useCallback((next: T) => {
    refs.current.onChange(transform(next, refs.current.emptyValue) as T);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onBlur = React.useCallback((e: React.FocusEvent<HTMLElement>) => {
    refs.current.onBlur?.(refs.current.id, (e.target as HTMLInputElement).value);
  }, []);
  const onFocus = React.useCallback((e: React.FocusEvent<HTMLElement>) => {
    refs.current.onFocus?.(refs.current.id, (e.target as HTMLInputElement).value);
  }, []);
  return { onChange, onBlur, onFocus };
}
