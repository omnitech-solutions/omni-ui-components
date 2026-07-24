import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';

import { RadioPrimitive, type RadioOption } from '@oc-tech/omni-ui-components';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/** RJSF Radio widget. */
export const RadioWidget = (props: WidgetProps) => {
  const { id, value, required, disabled, readonly, rawErrors, options } = props;
  const { onChange, onBlur, onFocus } = useStableRjsfCallbacks<string>(props, (next) => next);

  const radioOptions: RadioOption[] = React.useMemo(() => {
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

  return (
    <RadioPrimitive
      id={id}
      options={radioOptions}
      required={required}
      disabled={disabled || readonly}
      invalid={Boolean(rawErrors?.length)}
      orientation={orientation}
      value={(value as string | undefined) ?? undefined}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
    />
  );
};
