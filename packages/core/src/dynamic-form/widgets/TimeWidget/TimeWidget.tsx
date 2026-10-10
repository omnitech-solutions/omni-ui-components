import { TimePickerPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { numberOption, stringOption, widgetField, widgetLook } from '../../lib/widgetKit';

/** `time`: a time of day, stored as `HH:MM`. `ui:options.min`, `max` (`HH:MM`) and `step` (seconds). */
export const TimeWidget = (props: WidgetProps) => {
  const { value, options } = props;
  const { onChange } = useStableRjsfCallbacks<string>(props, (next) => next);
  return (
    <TimePickerPrimitive
      {...widgetField(props)}
      {...widgetLook(props)}
      value={(value as string | undefined) ?? ''}
      min={stringOption(options, 'min')}
      max={stringOption(options, 'max')}
      step={numberOption(options, 'step')}
      onChange={onChange}
    />
  );
};
