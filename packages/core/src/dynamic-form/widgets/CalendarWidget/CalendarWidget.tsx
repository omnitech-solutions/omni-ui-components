import { CalendarPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import * as React from 'react';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { fromIsoDate, toIsoDate, widgetField, widgetGroupName } from '../../lib/widgetKit';

/**
 * `calendar`: one day chosen on an always-open month grid, stored as `YYYY-MM-DD` (the same value as `date`).
 * `ui:options.min` and `max` (the same format) bound the days that can be chosen.
 */
export const CalendarWidget = (props: WidgetProps) => {
  const { value, options } = props;
  const { onChange } = useStableRjsfCallbacks<Date | null>(props, (next) =>
    next ? toIsoDate(next) : undefined,
  );
  const date = React.useMemo(() => fromIsoDate(value), [value]);
  return (
    <CalendarPrimitive
      {...widgetField(props, { requiredHint: true })}
      {...widgetGroupName(props)}
      value={date}
      min={fromIsoDate(options?.min) ?? undefined}
      max={fromIsoDate(options?.max) ?? undefined}
      onChange={onChange}
    />
  );
};
