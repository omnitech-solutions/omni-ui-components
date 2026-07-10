import * as React from 'react';

import { cn } from 'lib/utils';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import { DatePickerPrimitive } from './DatePickerPrimitive';
import type { DatePickerProps } from './DatePicker.types';

/** Chrome-wrapped Omni DatePicker (Popover + Calendar). Single or range mode. */
const DatePickerInner = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  ({ id: idProp, wrapperClassName, labelClassName, layout = 'vertical', label, description, error, required, invalid, className, ...primitiveProps }, ref) => {
    const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
      id: idProp,
      label,
      description,
      error,
      invalid,
      prefix: 'oui-date',
    });
    return (
      <FieldShell
        id={id}
        layout={layout}
        label={label}
        description={description}
        error={error}
        required={required}
        descriptionId={descriptionId}
        errorId={errorId}
        wrapperClassName={wrapperClassName}
        labelClassName={labelClassName}
      >
        <DatePickerPrimitive
          ref={ref}
          id={id}
          invalid={isInvalid}
          required={required}
          aria-describedby={describedBy}
          className={cn(className)}
          {...primitiveProps}
        />
      </FieldShell>
    );
  },
);
DatePickerInner.displayName = 'DatePicker';

export const DatePicker = React.memo(DatePickerInner) as typeof DatePickerInner;
