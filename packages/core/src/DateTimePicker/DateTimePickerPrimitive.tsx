import * as React from 'react';

import { cn } from 'lib/utils';
import { DatePickerPrimitive } from '../DatePicker';
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
  readOnly?: boolean;
  'aria-describedby'?: string;
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
export const DateTimePickerPrimitive = React.forwardRef<HTMLDivElement, DateTimePickerPrimitiveProps>(
  ({ id, value = '', onChange, min, max, disabled, required, invalid, readOnly, className, ...rest }, ref) => {
    const testId = rest['data-testid'] ?? id;
    const parts = splitIso(value);
    return (
      <div ref={ref} className={cn('flex w-full gap-2', className)} data-slot="date-time-picker" data-testid={testId}>
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
            required={required}
            invalid={invalid}
          />
        </div>
        <div className="w-44">
          <TimePickerPrimitive
            id={id ? `${id}-time` : undefined}
            value={parts.time}
            onChange={(next) => onChange?.(joinIso(parts.date, next))}
            disabled={disabled || !parts.date}
            readOnly={readOnly}
            required={required}
            invalid={invalid}
          />
        </div>
      </div>
    );
  },
);
DateTimePickerPrimitive.displayName = 'DateTimePickerPrimitive';
