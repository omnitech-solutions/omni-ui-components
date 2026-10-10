import { DatePickerPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import * as React from 'react';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { fromIsoDate, stringOption, toIsoDate, widgetField, widgetLook } from '../../lib/widgetKit';

/**
 * `date`: one day, stored as `YYYY-MM-DD`. `ui:options.min` and `max` (the same format) bound the calendar;
 * `ui:options.placeholder`.
 */
export const DateWidget = (props: WidgetProps) => {
  const { value, options, placeholder } = props;
  const { onChange } = useStableRjsfCallbacks<unknown>(props, (next) =>
    next instanceof Date ? toIsoDate(next) : undefined,
  );
  const date = React.useMemo(() => fromIsoDate(value), [value]);
  return (
    <DatePickerPrimitive
      {...widgetField(props, { requiredHint: true })}
      {...widgetLook(props)}
      mode="single"
      value={date}
      min={fromIsoDate(options?.min) ?? undefined}
      max={fromIsoDate(options?.max) ?? undefined}
      placeholder={stringOption(options, 'placeholder') ?? (placeholder || undefined)}
      onChange={onChange}
    />
  );
};
