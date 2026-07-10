import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';

import { TimePickerPrimitive } from '@omnitech/omni-ui-core';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/** RJSF Time widget — submits `HH:MM` (24h). */
export const TimeWidget = (props: WidgetProps) => {
  const { id, value, disabled, readonly, rawErrors, required } = props;
  const { onChange } = useStableRjsfCallbacks<string>(props, (next) => next);
  return (
    <TimePickerPrimitive
      id={id}
      value={(value as string | undefined) ?? ''}
      required={required}
      disabled={disabled || readonly}
      invalid={Boolean(rawErrors?.length)}
      onChange={onChange}
    />
  );
};
