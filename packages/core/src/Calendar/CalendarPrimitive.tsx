import { cn } from 'lib/utils';
import * as React from 'react';
import { Calendar as CalendarGrid } from '../components/ui/calendar';
import { useControllableState } from '../lib/use-controllable-state';
import type { CalendarPrimitiveProps } from './Calendar.types';

/**
 * An always-open month grid that holds ONE day: the date choice as a typed control (`value`, `onChange(next)`),
 * for a form that shows the calendar instead of hiding it behind a field. Use {@link CalendarField} for the
 * variant with a label, a description and an error; use `Calendar` for the raw grid with every
 * `react-day-picker` prop.
 *
 * Keyboard is the grid's own: arrow keys move by day and week, Page Up / Page Down by month, Enter or Space
 * chooses. Read-only keeps the grid focusable and browsable and refuses the choice.
 *
 * @example
 * <CalendarPrimitive value={day} onChange={setDay} min={new Date()} />
 */
const CalendarPrimitiveInner = React.forwardRef<HTMLDivElement, CalendarPrimitiveProps>(
  (
    {
      id,
      name,
      value: valueProp,
      defaultValue = null,
      onChange,
      min,
      max,
      defaultMonth,
      allowClear = true,
      disabled,
      readOnly,
      required,
      invalid,
      className,
      'data-testid': testId,
      'aria-describedby': ariaDescribedBy,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
    },
    ref,
  ) => {
    const [value, setValue] = useControllableState<Date | null>(valueProp, defaultValue, onChange);
    const isReadOnly = Boolean(readOnly) && !disabled;
    const blocked = [
      ...(disabled ? [true as const] : []),
      ...(min ? [{ before: min }] : []),
      ...(max ? [{ after: max }] : []),
    ];

    return (
      // biome-ignore lint/a11y/useSemanticElements: a fieldset would restyle the host; the group role is enough.
      <div
        ref={ref}
        id={id}
        role="group"
        tabIndex={-1}
        data-slot="calendar-field"
        data-testid={testId ?? id}
        data-state={disabled ? 'disabled' : isReadOnly ? 'readonly' : invalid ? 'invalid' : 'idle'}
        data-readonly={isReadOnly ? '' : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={invalid || undefined}
        aria-disabled={disabled || undefined}
        className={cn(
          'inline-flex w-fit max-w-full rounded-[var(--oui-radius-field)] border border-[var(--oui-border-field)] outline-none',
          invalid && 'border-[var(--oui-border-invalid)]',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <CalendarGrid
          mode="single"
          required={!allowClear || required}
          selected={value ?? undefined}
          defaultMonth={value ?? defaultMonth}
          disabled={blocked.length > 0 ? blocked : undefined}
          onSelect={(next?: Date) => {
            if (!isReadOnly && !disabled) setValue(next ?? null);
          }}
          className="border-0 bg-transparent"
        />
        {name ? (
          <input
            type="hidden"
            name={name}
            value={
              value
                ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
                : ''
            }
          />
        ) : null}
      </div>
    );
  },
);
CalendarPrimitiveInner.displayName = 'CalendarPrimitive';

export const CalendarPrimitive = React.memo(
  CalendarPrimitiveInner,
) as typeof CalendarPrimitiveInner;
