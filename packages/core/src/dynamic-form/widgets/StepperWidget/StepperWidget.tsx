import { StepperPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { rangeSpec } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import {
  formContextOf,
  numberOption,
  stringOption,
  widgetField,
  widgetGroupName,
} from '../../lib/widgetKit';

/**
 * `stepper`: a number with minus and plus. Bounds and step come from the schema. `ui:options.unit`,
 * `unitPlural`, `step`; `ui:options.iconKey` names a node in `formContext.icons` (icons are nodes the host
 * supplies, never names in a schema).
 */
export const StepperWidget = (props: WidgetProps) => {
  const { value, options, schema } = props;
  const { onChange } = useStableRjsfCallbacks<number>(props, (next) => next);
  const { min, max, step } = rangeSpec(schema);
  const iconKey = stringOption(options, 'iconKey');

  return (
    <StepperPrimitive
      {...widgetField(props, { requiredHint: true })}
      {...widgetGroupName(props)}
      value={typeof value === 'number' ? value : (min ?? 0)}
      min={min}
      max={max}
      step={numberOption(options, 'step') ?? step ?? 1}
      unit={stringOption(options, 'unit')}
      unitPlural={stringOption(options, 'unitPlural')}
      icon={iconKey ? formContextOf(props).icons?.[iconKey] : undefined}
      onChange={onChange}
    />
  );
};
