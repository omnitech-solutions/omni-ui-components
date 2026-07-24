import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';

import { DatePickerPrimitive } from '@oc-tech/omni-ui-components';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/** RJSF Date widget — stores YYYY-MM-DD strings. */
export const DateWidget = (props: WidgetProps) => {
  const { id, value, disabled, readonly, rawErrors, required } = props;
  const { onChange } = useStableRjsfCallbacks<Date | { from?: Date; to?: Date } | null>(props, (next) => {
    if (next instanceof Date) {
      const yyyy = next.getFullYear();
      const mm = String(next.getMonth() + 1).padStart(2, '0');
      const dd = String(next.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    return undefined;
  });

  const date = React.useMemo(() => {
    if (!value || typeof value !== 'string') return null;
    const d = new Date(`${value}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [value]);

  return (
    <DatePickerPrimitive
      id={id}
      mode="single"
      value={date}
      disabled={disabled || readonly}
      required={required}
      invalid={Boolean(rawErrors?.length)}
      onChange={onChange}
    />
  );
};
