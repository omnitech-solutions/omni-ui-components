import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';

import { MultiSelectPrimitive, type SelectOption } from '@omnitech/omni-ui-core';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/** RJSF MultiSelect widget — chip-rendering popover. */
export const MultiSelectWidget = (props: WidgetProps) => {
  const { id, value, disabled, readonly, rawErrors, required, placeholder, options } = props;
  const { onChange } = useStableRjsfCallbacks<string[]>(props, (next) => next);
  const selectOptions: SelectOption[] = React.useMemo(() => {
    const enumOptions = (options?.enumOptions as { value: unknown; label: string }[] | undefined) ?? [];
    return enumOptions.map((opt) => ({ value: String(opt.value), label: opt.label }));
  }, [options?.enumOptions]);
  return (
    <MultiSelectPrimitive
      id={id}
      options={selectOptions}
      value={Array.isArray(value) ? (value as unknown[]).map(String) : []}
      placeholder={placeholder}
      searchable={Boolean(options?.searchable)}
      required={required}
      disabled={disabled || readonly}
      invalid={Boolean(rawErrors?.length)}
      onChange={onChange}
    />
  );
};
