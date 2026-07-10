import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';

import { ColorPickerPrimitive } from '@omnitech/omni-ui-core';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/** RJSF Color widget — submits `#rrggbb`. */
export const ColorWidget = (props: WidgetProps) => {
  const { id, value, disabled, readonly, rawErrors, required } = props;
  const { onChange } = useStableRjsfCallbacks<string>(props, (next) => next);
  return (
    <ColorPickerPrimitive
      id={id}
      value={(value as string | undefined) ?? '#3b82f6'}
      required={required}
      disabled={disabled || readonly}
      invalid={Boolean(rawErrors?.length)}
      onChange={onChange}
    />
  );
};
