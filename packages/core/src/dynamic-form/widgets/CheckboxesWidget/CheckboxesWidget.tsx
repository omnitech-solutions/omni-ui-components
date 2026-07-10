import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';

import { CheckboxGroupPrimitive, type CheckboxOption } from '@omnitech/omni-ui-core';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/** RJSF Checkboxes widget for `type: 'array'` with `items.enum` / `items.oneOf`. */
export const CheckboxesWidget = (props: WidgetProps) => {
  const { id, value, required, disabled, readonly, rawErrors, options } = props;
  const { onChange, onBlur, onFocus } = useStableRjsfCallbacks<string[]>(props, (next) => next);

  const checkboxOptions: CheckboxOption[] = React.useMemo(() => {
    const enumOptions = (options?.enumOptions as { value: unknown; label: string }[] | undefined) ?? [];
    const enumDisabled = (options?.enumDisabled as unknown[] | undefined) ?? [];
    const descriptions = (options?.optionDescriptions as Record<string, string> | undefined) ?? {};
    return enumOptions.map((opt) => ({
      value: String(opt.value),
      label: opt.label,
      description: descriptions[String(opt.value)],
      disabled: enumDisabled.includes(opt.value),
    }));
  }, [options?.enumOptions, options?.enumDisabled, options?.optionDescriptions]);

  const orientation = options?.inline ? 'horizontal' : 'vertical';
  const valueArray = React.useMemo(() => (Array.isArray(value) ? (value as unknown[]).map(String) : []), [value]);

  return (
    <CheckboxGroupPrimitive
      id={id}
      options={checkboxOptions}
      required={required}
      disabled={disabled || readonly}
      invalid={Boolean(rawErrors?.length)}
      orientation={orientation}
      value={valueArray}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
    />
  );
};
