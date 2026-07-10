import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';
import { rangeSpec } from '@rjsf/utils';

import { NumberInputPrimitive } from '@omnitech/omni-ui-core';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/** RJSF NumberInput widget — formatted numeric input. */
export const NumberInputWidget = (props: WidgetProps) => {
  const { id, value, disabled, readonly, rawErrors, required, placeholder, options, schema } = props;
  const { onChange } = useStableRjsfCallbacks<number | null>(props, (next) => next ?? undefined);
  const { min, max, step } = rangeSpec(schema);
  return (
    <NumberInputPrimitive
      id={id}
      value={typeof value === 'number' ? value : null}
      min={min}
      max={max}
      step={step}
      decimals={typeof options?.decimals === 'number' ? (options.decimals as number) : undefined}
      thousandSeparator={Boolean(options?.thousandSeparator)}
      prefix={(options?.prefix as string | undefined) ?? undefined}
      suffix={(options?.suffix as string | undefined) ?? undefined}
      placeholder={placeholder}
      required={required}
      disabled={disabled || readonly}
      invalid={Boolean(rawErrors?.length)}
      onChange={onChange}
    />
  );
};
