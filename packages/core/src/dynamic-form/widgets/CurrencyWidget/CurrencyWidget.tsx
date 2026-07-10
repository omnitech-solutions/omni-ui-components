import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';

import { CurrencyInputPrimitive } from '@omnitech/omni-ui-core';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/** RJSF Currency widget for monetary fields. */
export const CurrencyWidget = (props: WidgetProps) => {
  const { id, value, disabled, readonly, rawErrors, required, placeholder, options } = props;
  const { onChange } = useStableRjsfCallbacks<number | null>(props, (next) => next ?? undefined);
  return (
    <CurrencyInputPrimitive
      id={id}
      value={typeof value === 'number' ? value : null}
      currency={(options?.currency as string | undefined) ?? 'USD'}
      locale={(options?.locale as string | undefined) ?? undefined}
      placeholder={placeholder}
      required={required}
      disabled={disabled || readonly}
      invalid={Boolean(rawErrors?.length)}
      onChange={onChange}
    />
  );
};
