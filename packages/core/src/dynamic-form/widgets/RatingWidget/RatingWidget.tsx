import { RatePrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { numberOption, sizeOf, widgetField, widgetGroupName } from '../../lib/widgetKit';

/**
 * `rating`: a score as marks, stored as an integer. The number of marks is `ui:options.count`, else the
 * schema's `maximum`, else 5. Choosing the chosen mark again clears the field unless it is required.
 */
export const RatingWidget = (props: WidgetProps) => {
  const { value, options, schema, required } = props;
  const { onChange } = useStableRjsfCallbacks<number>(props, (next) => next || undefined);
  return (
    <RatePrimitive
      {...widgetField(props)}
      {...widgetGroupName(props)}
      value={typeof value === 'number' ? value : 0}
      count={numberOption(options, 'count') ?? schema.maximum ?? 5}
      allowClear={!required}
      size={sizeOf(props)}
      onChange={onChange}
    />
  );
};
