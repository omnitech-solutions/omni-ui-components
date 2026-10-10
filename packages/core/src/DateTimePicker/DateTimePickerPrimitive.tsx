import { cn } from 'lib/utils';
import * as React from 'react';
import { DatePickerPrimitive } from '../DatePicker';
import type { InputSize, InputVariant } from '../Input/Input.variants';
import { TimePickerPrimitive } from '../TimePicker';

export interface DateTimePickerPrimitiveProps {
  id?: string;
  name?: string;
  value?: string;
  onChange?: (next: string) => void;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  /** The look of the field box. Default `bordered`. */
  variant?: InputVariant;
  /** The height of the field box. Default `default`. */
  inputSize?: InputSize;
  readOnly?: boolean;
  /** Id of the element that names the pair: the date button is named by it and its own date, the time field by it. */
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  /** Name of the time field when nothing labels the pair. */
  timeLabel?: string;
  'data-testid'?: string;
  className?: string;
}

const isoToDate = (s?: string): Date | null => {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

const dateToIsoDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const splitIso = (s?: string): { date: string; time: string } => {
  if (!s) return { date: '', time: '' };
  const [date, time = ''] = s.split('T');
  return { date, time: time.slice(0, 8) };
};

const joinIso = (date: string, time: string): string => {
  if (!date) return '';
  if (!time) return `${date}T00:00`;
  return `${date}T${time}`;
};

/** Raw date + time pair (no chrome). */
export const DateTimePickerPrimitive = React.forwardRef<
  HTMLDivElement,
  DateTimePickerPrimitiveProps
>(
  (
    {
      id,
      value = '',
      onChange,
      min,
      max,
      disabled,
      required,
      invalid,
      readOnly,
      variant,
      inputSize,
      className,
      timeLabel = 'Time',
      ...rest
    },
    ref,
  ) => {
    const testId = rest['data-testid'] ?? id;
    const parts = splitIso(value);
    const labelledBy = rest['aria-labelledby'];
    return (
      <div
        ref={ref}
        id={id}
        className={cn('flex w-full gap-2', className)}
        data-slot="date-time-picker"
        data-testid={testId}
      >
        <div className="flex-1">
          <DatePickerPrimitive
            id={id ? `${id}-date` : undefined}
            value={isoToDate(value)}
            min={min}
            max={max}
            onChange={(next) => {
              if (next instanceof Date) onChange?.(joinIso(dateToIsoDate(next), parts.time));
              else onChange?.('');
            }}
            disabled={disabled}
            readOnly={readOnly}
            variant={variant}
            inputSize={inputSize}
            required={required}
            invalid={invalid}
            aria-labelledby={labelledBy && id ? `${labelledBy} ${id}-date` : undefined}
            aria-describedby={rest['aria-describedby']}
          />
        </div>
        <div className="w-44">
          <TimePickerPrimitive
            id={id ? `${id}-time` : undefined}
            value={parts.time}
            onChange={(next) => onChange?.(joinIso(parts.date, next))}
            disabled={disabled || !parts.date}
            readOnly={readOnly}
            variant={variant}
            inputSize={inputSize}
            required={required}
            invalid={invalid}
            aria-label={labelledBy ? undefined : timeLabel}
            aria-labelledby={labelledBy}
            aria-describedby={rest['aria-describedby']}
          />
        </div>
      </div>
    );
  },
);
DateTimePickerPrimitive.displayName = 'DateTimePickerPrimitive';
