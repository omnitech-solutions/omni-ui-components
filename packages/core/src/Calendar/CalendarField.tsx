import * as React from 'react';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import type { CalendarFieldProps } from './Calendar.types';
import { CalendarPrimitive } from './CalendarPrimitive';

/**
 * {@link CalendarPrimitive} inside the shared field chrome: label, required mark, description and error.
 *
 * @example
 * <CalendarField label="Start date" description="Weekdays only." value={day} onChange={setDay} />
 */
const CalendarFieldInner = React.forwardRef<HTMLDivElement, CalendarFieldProps>(
  (
    {
      id: idProp,
      label,
      description,
      error,
      required,
      invalid,
      layout = 'vertical',
      wrapperClassName,
      labelClassName,
      ...primitiveProps
    },
    ref,
  ) => {
    const { id, isInvalid, descriptionId, errorId, requiredId, describedBy } = useFieldChrome({
      id: idProp,
      label,
      description,
      error,
      invalid,
      required,
      requiredHint: true,
      prefix: 'oui-calendar',
    });
    const labelId = label ? `${id}-label` : undefined;
    return (
      <FieldShell
        id={id}
        layout={layout}
        label={label}
        labelTag="span"
        labelId={labelId}
        description={description}
        error={error}
        required={required}
        descriptionId={descriptionId}
        errorId={errorId}
        requiredId={requiredId}
        wrapperClassName={wrapperClassName}
        labelClassName={labelClassName}
      >
        <CalendarPrimitive
          ref={ref}
          id={id}
          required={required}
          invalid={isInvalid}
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          {...primitiveProps}
        />
      </FieldShell>
    );
  },
);
CalendarFieldInner.displayName = 'CalendarField';

export const CalendarField = React.memo(CalendarFieldInner) as typeof CalendarFieldInner;
