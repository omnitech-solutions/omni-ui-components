import * as React from 'react';
import { Minus, Plus } from 'lucide-react';

import { cn } from 'lib/utils';
import type { StepperPrimitiveProps } from './Stepper.types';

/**
 * Raw Omni Stepper primitive — pill-shaped row with optional leading
 * icon, value display, and minus/plus buttons. Used standalone, or
 * wrapped by `{@link Stepper}` for label / description / error chrome.
 *
 * Defaults: `min=0`, `max=Infinity`, `step=1`. Buttons respect bounds
 * (decrement disabled at `min`, increment at `max`).
 *
 * @example
 * <StepperPrimitive icon={<FileText />} unit="page" value={pages} onChange={setPages} min={1} max={50} />
 */
const StepperPrimitiveInner = React.forwardRef<HTMLDivElement, StepperPrimitiveProps>(
  (
    {
      id,
      name: _name,
      className,
      value,
      defaultValue,
      onChange,
      min = 0,
      max = Number.POSITIVE_INFINITY,
      step = 1,
      disabled,
      required,
      invalid,
      icon,
      unit,
      unitPlural,
      formatValue,
      stepperSize = 'default',
      'aria-describedby': ariaDescribedBy,
      'aria-label': ariaLabel,
      ...rest
    },
    ref,
  ) => {
    const restAny = rest as Record<string, unknown>;
    const testId = typeof restAny['data-testid'] === 'string' && restAny['data-testid'].length > 0 ? (restAny['data-testid'] as string) : id;

    const [internal, setInternal] = React.useState<number>(defaultValue ?? min);
    const isControlled = value !== undefined;
    const current = isControlled ? (value as number) : internal;

    const commit = (next: number) => {
      const clamped = Math.min(max, Math.max(min, next));
      if (!isControlled) setInternal(clamped);
      onChange?.(clamped);
    };

    const decrement = () => commit(current - step);
    const increment = () => commit(current + step);

    const atMin = current <= min;
    const atMax = current >= max;

    const renderedValue = (() => {
      if (formatValue) return formatValue(current);
      if (unit) {
        const word = current === 1 ? unit : (unitPlural ?? `${unit}s`);
        return `${current} ${word}`;
      }
      return current;
    })();

    const heightClass = stepperSize === 'sm' ? 'h-8' : stepperSize === 'lg' ? 'h-11' : 'h-9';
    const btnSizeClass = stepperSize === 'sm' ? 'size-6' : stepperSize === 'lg' ? 'size-9' : 'size-7';

    return (
      <div
        ref={ref}
        id={id}
        data-testid={testId}
        data-slot="stepper"
        data-disabled={disabled || undefined}
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border border-[var(--oui-border-field)] bg-muted/40 px-2 min-w-fit whitespace-nowrap',
          heightClass,
          disabled && 'cursor-not-allowed opacity-50',
          invalid && 'border-[var(--oui-border-invalid)]',
          className,
        )}
      >
        <span
          data-slot="stepper-value"
          className="inline-flex items-center gap-1.5 px-2 text-sm font-medium tabular-nums text-[var(--oui-foreground)] whitespace-nowrap"
        >
          {icon ? (
            <span aria-hidden="true" className="inline-flex shrink-0 items-center text-[var(--oui-foreground-muted)] [&_svg]:size-3.5">
              {icon}
            </span>
          ) : null}
          {renderedValue}
        </span>
        <button
          type="button"
          data-slot="stepper-decrement"
          data-testid={testId ? `${testId}-decrement` : undefined}
          disabled={disabled || atMin}
          aria-label="Decrease"
          onClick={decrement}
          className={cn(
            'inline-flex items-center justify-center rounded-full cursor-pointer',
            'bg-muted-foreground/25 text-[var(--oui-foreground)] shadow-sm',
            'hover:bg-muted-foreground/45 transition-colors',
            'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-muted-foreground/25',
            btnSizeClass,
          )}
        >
          <Minus className="size-3.5" />
        </button>
        <button
          type="button"
          data-slot="stepper-increment"
          data-testid={testId ? `${testId}-increment` : undefined}
          disabled={disabled || atMax}
          aria-label="Increase"
          onClick={increment}
          className={cn(
            'inline-flex items-center justify-center rounded-full cursor-pointer',
            'bg-muted-foreground/25 text-[var(--oui-foreground)] shadow-sm',
            'hover:bg-muted-foreground/45 transition-colors',
            'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-muted-foreground/25',
            btnSizeClass,
          )}
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    );
  },
);
StepperPrimitiveInner.displayName = 'StepperPrimitive';

export const StepperPrimitive = React.memo(StepperPrimitiveInner) as typeof StepperPrimitiveInner;
