import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';

import { DateTimePickerPrimitive } from '@oc-tech/omni-ui-components';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/** RJSF DateTime widget for `type: 'string', format: 'date-time'`. */
export const DateTimeWidget = (props: WidgetProps) => {
  const { id, value, disabled, readonly, rawErrors, required } = props;
  const { onChange } = useStableRjsfCallbacks<string>(props, (next) => next || undefined);
  return (
    <DateTimePickerPrimitive
      id={id}
      value={(value as string | undefined) ?? ''}
      required={required}
      disabled={disabled || readonly}
      invalid={Boolean(rawErrors?.length)}
      onChange={onChange}
    />
  );
};
