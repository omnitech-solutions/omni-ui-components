import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';

import { InputOTPPrimitive } from '@omnitech/omni-ui-core';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/** RJSF InputOTP widget — one-time-code grid. */
export const InputOTPWidget = (props: WidgetProps) => {
  const { id, value, disabled, readonly, rawErrors, required, options, schema } = props;
  const { onChange } = useStableRjsfCallbacks<string>(props, (next) => next);
  const length = (options?.length as number | undefined) ?? (schema.maxLength as number | undefined) ?? 6;
  return (
    <InputOTPPrimitive
      id={id}
      value={(value as string | undefined) ?? ''}
      length={length}
      disabled={disabled || readonly}
      required={required}
      invalid={Boolean(rawErrors?.length)}
      onChange={onChange}
    />
  );
};
