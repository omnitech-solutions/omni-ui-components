import { DateTimePickerPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { fromIsoDate, widgetField, widgetGroupName, widgetLook } from '../../lib/widgetKit';

const pad = (n: number) => String(n).padStart(2, '0');

/** An ISO instant (`2026-10-09T16:30:00.000Z`) as the local `YYYY-MM-DDTHH:mm` the control shows. */
export const instantToLocal = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/** The control's local `YYYY-MM-DD[THH:mm]` as an ISO instant; a day with no time is local midnight. */
export const localToInstant = (value: string): string | undefined => {
  const date = new Date(value.includes('T') ? value : `${value}T00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

/**
 * `dateTime`: a day and a time. Stored as a local ISO string (`YYYY-MM-DDTHH:mm`) by default, or with
 * `ui:options.storage: 'instant'` as an ISO instant in UTC (`…Z`), which is what a server usually keeps.
 * Clearing the day stores `undefined`. `ui:options.min` and `max` (`YYYY-MM-DD`).
 */
export const DateTimeWidget = (props: WidgetProps) => {
  const { value, options } = props;
  const instant = options?.storage === 'instant';
  const { onChange } = useStableRjsfCallbacks<string>(props, (next) =>
    next ? (instant ? localToInstant(next) : next) : undefined,
  );
  const { 'aria-labelledby': labelledBy } = widgetGroupName(props);
  const stored = typeof value === 'string' ? value : '';
  return (
    <DateTimePickerPrimitive
      {...widgetField(props, { requiredHint: true })}
      {...widgetLook(props)}
      aria-labelledby={labelledBy}
      value={instant && stored ? instantToLocal(stored) : stored}
      min={fromIsoDate(options?.min) ?? undefined}
      max={fromIsoDate(options?.max) ?? undefined}
      onChange={onChange}
    />
  );
};
