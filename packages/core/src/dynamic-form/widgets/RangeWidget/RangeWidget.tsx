import { SliderPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { rangeSpec } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { numberOption, widgetField, widgetGroupName } from '../../lib/widgetKit';

/**
 * `range`: a slider. The schema type picks the mode: a number is one thumb; an array of two numbers
 * (`minItems: 2`, `maxItems: 2`, bounds on `items`) is a from-to range with two thumbs.
 * `ui:options.step`, `minStepsBetweenThumbs`, and `thumbLabels: ['From', 'To']` to name the two thumbs.
 */
export const RangeWidget = (props: WidgetProps) => {
  const { value, options, schema } = props;
  const { onChange } = useStableRjsfCallbacks<number | number[]>(props, (next) => next);
  const isRange = schema.type === 'array';
  const { min, max, step } = rangeSpec(isRange ? (schema.items as typeof schema) : schema);
  const low = (min ?? 0) as number;
  const high = (max ?? 100) as number;

  return (
    <SliderPrimitive
      {...widgetField(props, { requiredHint: true })}
      {...widgetGroupName(props)}
      value={
        isRange
          ? Array.isArray(value) && value.length === 2
            ? (value as number[])
            : [low, high]
          : typeof value === 'number'
            ? value
            : low
      }
      min={min}
      max={max}
      step={numberOption(options, 'step') ?? step}
      minStepsBetweenThumbs={numberOption(options, 'minStepsBetweenThumbs')}
      thumbLabels={
        Array.isArray(options?.thumbLabels) ? (options.thumbLabels as string[]) : undefined
      }
      onChange={onChange}
    />
  );
};
