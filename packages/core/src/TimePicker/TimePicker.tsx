import * as React from 'react';

import { cn } from 'lib/utils';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import { TimePickerPrimitive } from './TimePickerPrimitive';
import type { FieldLayoutProps } from '../Input/Input.variants';
import type { RootProps } from '../lib';

export interface TimePickerProps extends RootProps, FieldLayoutProps {
  id?: string;
  name?: string;
  /** Time value in `HH:MM` (24h) form. */
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
  step?: number;
  min?: string;
  max?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
  className?: string;
  'data-testid'?: string;
}

/**
 * Omni TimePicker — chrome-wrapped {@link TimePickerPrimitive}.
 *
 * @example
 * <TimePicker label="Start time" value={start} onChange={setStart} />
 */
const TimePickerInner = React.forwardRef<HTMLInputElement, TimePickerProps>(
  ({ id: idProp, wrapperClassName, labelClassName, layout = 'vertical', label, description, error, required, invalid, className, ...primitiveProps }, ref) => {
    const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
      id: idProp,
      label,
      description,
      error,
      invalid,
      prefix: 'oui-time',
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
        labelTag="label"
      >
        <TimePickerPrimitive
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
TimePickerInner.displayName = 'TimePicker';

export const TimePicker = React.memo(TimePickerInner) as typeof TimePickerInner;
