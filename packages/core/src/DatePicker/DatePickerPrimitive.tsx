import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Calendar } from 'components/ui/calendar';

import { cn } from 'lib/utils';
import { inputVariants } from '../Input/Input.variants';
import type { DatePickerPrimitiveProps, DateRange } from './DatePicker.types';

const defaultFormat: Intl.DateTimeFormatOptions = { dateStyle: 'medium' };

const formatDate = (d: Date | undefined | null, opts: Intl.DateTimeFormatOptions): string => {
  if (!d) return '';
  return new Intl.DateTimeFormat(undefined, opts).format(d);
};

const isRange = (v: unknown): v is DateRange =>
  Boolean(v) && typeof v === 'object' && !(v instanceof Date) && ('from' in (v as object) || 'to' in (v as object));

/**
 * Raw Omni DatePicker primitive — Popover-triggered Calendar.
 * Supports both single-date and date-range modes.
 *
 * @example
 * <DatePickerPrimitive value={date} onChange={setDate} placeholder="Pick a date" />
 * <DatePickerPrimitive mode="range" value={range} onChange={setRange} />
 */
const DatePickerPrimitiveInner = React.forwardRef<HTMLButtonElement, DatePickerPrimitiveProps>(
  (
    {
      id,
      name: _name,
      className,
      mode = 'single',
      value,
      defaultValue,
      onChange,
      min,
      max,
      disabled,
      required,
      invalid,
      placeholder = 'Pick a date',
      formatOptions = defaultFormat,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const restAny = rest as Record<string, unknown>;
    const testId = typeof restAny['data-testid'] === 'string' && restAny['data-testid'].length > 0 ? (restAny['data-testid'] as string) : id;

    const [internal, setInternal] = React.useState<Date | DateRange | null>(defaultValue ?? null);
    const isControlled = value !== undefined;
    const current = isControlled ? value : internal;

    const commit = (next: Date | DateRange | undefined) => {
      const resolved = next ?? null;
      if (!isControlled) setInternal(resolved);
      onChange?.(resolved);
    };

    const label = (() => {
      if (!current) return placeholder;
      if (isRange(current)) {
        if (!current.from && !current.to) return placeholder;
        const fromLabel = formatDate(current.from, formatOptions);
        const toLabel = formatDate(current.to, formatOptions);
        return current.to ? `${fromLabel} – ${toLabel}` : fromLabel || placeholder;
      }
      return formatDate(current as Date, formatOptions);
    })();
    const isPlaceholder = label === placeholder;

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={ref}
            type="button"
            id={id}
            disabled={disabled}
            data-testid={testId}
            data-slot="date-picker"
            data-state={disabled ? 'disabled' : invalid ? 'invalid' : 'idle'}
            data-placeholder={isPlaceholder || undefined}
            aria-invalid={invalid || undefined}
            aria-required={required || undefined}
            aria-describedby={ariaDescribedBy}
            aria-haspopup="dialog"
            aria-expanded={open}
            className={cn(
              inputVariants({ variant: 'bordered', inputSize: 'default' }),
              'items-center justify-between gap-2 px-3 text-left cursor-pointer',
              'disabled:cursor-not-allowed',
              isPlaceholder && 'text-[var(--oui-foreground-placeholder)]',
              className,
            )}
          >
            <span className="truncate">{label}</span>
            {!isPlaceholder && !disabled ? (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear date"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  commit(undefined);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    commit(undefined);
                  }
                }}
                className="inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-[var(--oui-foreground-muted)] transition-colors hover:bg-blue-500/10 hover:text-blue-300"
              >
                <X className="size-3.5" aria-hidden="true" />
              </span>
            ) : (
              <CalendarIcon className="size-4 shrink-0 text-[var(--oui-foreground-muted)]" aria-hidden="true" />
            )}
          </button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            data-testid={`${testId}-popover`}
            className={cn(
              'z-50 rounded-md border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] p-3 shadow-md outline-none',
              /* Tame the shadcn Calendar's default DayButton styles so days
               * read as transparent / clean in Omni dark-mode. */
              '[&_[data-slot="calendar"]_button]:bg-transparent',
              '[&_[data-slot="calendar"]_button]:font-normal',
              '[&_[data-slot="calendar"]_button]:cursor-pointer',
              '[&_[data-slot="calendar"]_button:hover]:!bg-primary/15',
              '[&_[data-slot="calendar"]_button:hover]:!text-foreground',
              '[&_[data-slot="calendar"]_button[data-selected-single=true]]:!bg-primary',
              '[&_[data-slot="calendar"]_button[data-selected-single=true]]:!text-primary-foreground',
              '[&_[data-slot="calendar"]_button[data-range-start=true]]:!bg-primary',
              '[&_[data-slot="calendar"]_button[data-range-start=true]]:!text-primary-foreground',
              '[&_[data-slot="calendar"]_button[data-range-end=true]]:!bg-primary',
              '[&_[data-slot="calendar"]_button[data-range-end=true]]:!text-primary-foreground',
              '[&_[data-slot="calendar"]_button[data-range-middle=true]]:!bg-primary/20',
              '[&_[data-slot="calendar"]_button[data-range-middle=true]]:!text-foreground',
            )}
          >
            {mode === 'range' ? (
              <div className="flex flex-col gap-2">
                <Calendar
                  mode="range"
                  defaultMonth={current && isRange(current) ? current.from : undefined}
                  selected={current && isRange(current) ? current : undefined}
                  onSelect={(next) => commit(next)}
                  disabled={(date: Date) => Boolean((min && date < min) || (max && date > max))}
                  numberOfMonths={2}
                />
                <div className="flex justify-end gap-2 border-t border-[var(--oui-border-field)] pt-2">
                  <button
                    type="button"
                    onClick={() => commit(undefined)}
                    className="cursor-pointer rounded-md border-0 bg-transparent px-2 py-1 text-xs font-medium text-[var(--oui-foreground-muted)] hover:bg-blue-500/10 hover:text-blue-300"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="cursor-pointer rounded-md border-0 bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <Calendar
                mode="single"
                selected={(current as Date | undefined) ?? undefined}
                onSelect={(next: Date | undefined) => {
                  commit(next);
                  if (next) setOpen(false);
                }}
                disabled={(date: Date) => Boolean((min && date < min) || (max && date > max))}
              />
            )}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  },
);
DatePickerPrimitiveInner.displayName = 'DatePickerPrimitive';

export const DatePickerPrimitive = React.memo(DatePickerPrimitiveInner) as typeof DatePickerPrimitiveInner;
