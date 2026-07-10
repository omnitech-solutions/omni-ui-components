import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';

import { PhoneInputPrimitive } from '@omnitech/omni-ui-core';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/** RJSF Phone widget. `ui:options.defaultDialCode` (e.g. `+1`) prefills the dial code. */
export const PhoneWidget = (props: WidgetProps) => {
  const { id, value, disabled, readonly, rawErrors, required, placeholder, options } = props;
  const { onChange } = useStableRjsfCallbacks<string>(props, (next) => next);
  return (
    <PhoneInputPrimitive
      id={id}
      value={(value as string | undefined) ?? ''}
      defaultDialCode={(options?.defaultDialCode as string | undefined) ?? undefined}
      placeholder={placeholder}
      required={required}
      disabled={disabled || readonly}
      invalid={Boolean(rawErrors?.length)}
      onChange={onChange}
    />
  );
};
