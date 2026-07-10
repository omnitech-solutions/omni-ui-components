import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';
import { rangeSpec } from '@rjsf/utils';

import { SliderPrimitive } from '@omnitech/omni-ui-core';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/** RJSF Range widget — slider for numeric schemas. */
export const RangeWidget = (props: WidgetProps) => {
  const { id, value, disabled, readonly, rawErrors, options, schema } = props;
  const { onChange } = useStableRjsfCallbacks<number | number[]>(props, (next) => next);

  const { min, max, step } = rangeSpec(schema);
  const resolvedStep = typeof options?.step === 'number' ? (options.step as number) : step;

  const valueNum = typeof value === 'number' ? (value as number) : ((min ?? 0) as number);

  return (
    <SliderPrimitive
      id={id}
      value={valueNum}
      min={min}
      max={max}
      step={resolvedStep}
      disabled={disabled || readonly}
      invalid={Boolean(rawErrors?.length)}
      onChange={onChange}
    />
  );
};
