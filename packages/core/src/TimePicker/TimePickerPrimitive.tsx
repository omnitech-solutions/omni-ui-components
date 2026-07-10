import * as React from 'react';
import { Clock } from 'lucide-react';

import { cn } from 'lib/utils';
import { inputVariants } from '../Input/Input.variants';
import type { RootProps } from '../lib';

export interface TimePickerPrimitiveProps extends RootProps {
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
  className?: string;
  'aria-describedby'?: string;
  'data-testid'?: string;
}

// Bare TimePicker primitive — input[type=time] plus clock-icon overlay.
// For an Apple-style popover wheel picker (used by DateTimePicker), see
// TimeWheelPrimitive.
const TimePickerPrimitiveInner = React.forwardRef<HTMLInputElement, TimePickerPrimitiveProps>(
  (
    {
      id,
      name,
      value = '',
      defaultValue,
      onChange,
      step = 60,
      min,
      max,
      disabled,
      readOnly,
      required,
      invalid,
      className,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref,
  ) => {
    const restAny = rest as Record<string, unknown>;
    const testId = typeof restAny['data-testid'] === 'string' && restAny['data-testid'].length > 0 ? (restAny['data-testid'] as string) : id;
    return (
      <div className="relative flex w-full items-center" data-slot="time-picker-wrapper">
        <input
          ref={ref}
          id={id}
          name={name}
          type="time"
          value={value}
          defaultValue={defaultValue}
          step={step}
          min={min}
          max={max}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={ariaDescribedBy}
          data-slot="time-picker"
          data-testid={testId}
          className={cn(inputVariants({ variant: 'bordered', inputSize: 'default' }), 'px-3 pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0', className)}
        />
        <Clock aria-hidden="true" className="pointer-events-none absolute right-3 size-4 shrink-0 text-[var(--oui-foreground-muted)]" />
      </div>
    );
  },
);
TimePickerPrimitiveInner.displayName = 'TimePickerPrimitive';

export const TimePickerPrimitive = React.memo(TimePickerPrimitiveInner) as typeof TimePickerPrimitiveInner;
