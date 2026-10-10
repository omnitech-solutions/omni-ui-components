import { NumberInputPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { rangeSpec } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { numberOption, stringOption, widgetField, widgetLook } from '../../lib/widgetKit';

/** `numberInput`: a typed number; empty is `undefined`. `ui:options.decimals`, `thousandSeparator`, `prefix`, `suffix`. */
export const NumberInputWidget = (props: WidgetProps) => {
  const { value, placeholder, options, schema } = props;
  const { onChange } = useStableRjsfCallbacks<number | null>(props, (next) => next ?? undefined);
  const { min, max, step } = rangeSpec(schema);
  return (
    <NumberInputPrimitive
      {...widgetField(props)}
      {...widgetLook(props)}
      value={typeof value === 'number' ? value : null}
      min={min}
      max={max}
      step={step}
      decimals={numberOption(options, 'decimals')}
      thousandSeparator={Boolean(options?.thousandSeparator)}
      prefix={stringOption(options, 'prefix')}
      suffix={stringOption(options, 'suffix')}
      placeholder={placeholder}
      onChange={onChange}
    />
  );
};
