import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';
import { rangeSpec } from '@rjsf/utils';
import { FileText } from 'lucide-react';

import { StepperPrimitive } from '@omnitech/omni-ui-core';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/** RJSF Stepper widget for `type: 'integer' | 'number'` schemas. */
export const StepperWidget = (props: WidgetProps) => {
  const { id, value, disabled, readonly, rawErrors, options, schema } = props;
  const { onChange } = useStableRjsfCallbacks<number>(props, (next) => next);

  const { min, max, step } = rangeSpec(schema);
  const resolvedStep = typeof options?.step === 'number' ? (options.step as number) : (step ?? 1);
  const unit = (options?.unit as string | undefined) ?? undefined;
  const unitPlural = (options?.unitPlural as string | undefined) ?? undefined;
  const iconName = (options?.icon as string | undefined) ?? undefined;
  const iconNode = iconName === 'fileText' ? <FileText /> : undefined;

  const valueNum = typeof value === 'number' ? (value as number) : (min ?? 0);

  return (
    <StepperPrimitive
      id={id}
      value={valueNum}
      min={min}
      max={max}
      step={resolvedStep}
      unit={unit}
      unitPlural={unitPlural}
      icon={iconNode}
      disabled={disabled || readonly}
      invalid={Boolean(rawErrors?.length)}
      onChange={onChange}
    />
  );
};
