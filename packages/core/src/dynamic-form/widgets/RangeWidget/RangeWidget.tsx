import { SliderPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { rangeSpec } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/** RJSF Range widget — slider for numeric schemas. */
export const RangeWidget = (props: WidgetProps) => {
  const { id, value, disabled, readonly, rawErrors, options, schema, label } = props;
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
      // The field template's label points at the slider's root; the thumb is named here.
      aria-label={label || schema.title || undefined}
      onChange={onChange}
    />
  );
};
