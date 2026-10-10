import { cn } from 'lib/utils';
import * as React from 'react';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import type { DatePickerProps } from './DatePicker.types';
import { DatePickerPrimitive } from './DatePickerPrimitive';

/** Chrome-wrapped Omni DatePicker (Popover + Calendar). Single or range mode. */
const DatePickerInner = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      id: idProp,
      wrapperClassName,
      labelClassName,
      layout = 'vertical',
      label,
      description,
      error,
      required,
      invalid,
      className,
      ...primitiveProps
    },
    ref,
  ) => {
    const { id, isInvalid, descriptionId, errorId, requiredId, describedBy } = useFieldChrome({
      id: idProp,
      required,
      // The control cannot carry `aria-required`: it is described by a hidden "Required" hint instead.
      requiredHint: true,
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
        requiredId={requiredId}
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
