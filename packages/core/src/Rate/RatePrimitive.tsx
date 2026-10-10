import { cn } from 'lib/utils';
import { Star } from 'lucide-react';
import * as React from 'react';
import { useControllableState } from '../lib/use-controllable-state';
import { DEFAULT_RATE_LABELS, type RatePrimitiveProps } from './Rate.types';
import { rateMarkVariants } from './Rate.variants';

const DEFAULT_ICON = <Star aria-hidden="true" />;

/**
 * Raw Omni Rate primitive: a `radiogroup` of marks. The mark equal to the value is the checked radio; marks up to
 * it are drawn filled. One tab stop; Left / Down lower, Right / Up raise, Home and End jump to the ends, and the
 * value follows focus as in any radio group. Activating the current value again clears it (`allowClear`).
 *
 * @example
 * <RatePrimitive aria-label="Score" defaultValue={3} onChange={(next) => save(next)} />
 */
const RatePrimitiveInner = React.forwardRef<HTMLDivElement, RatePrimitiveProps>(
  (
    {
      id,
      name,
      value,
      defaultValue = 0,
      onChange,
      count = 5,
      allowClear = true,
      icon = DEFAULT_ICON,
      size = 'default',
      disabled,
      readOnly,
      required,
      invalid,
      labels,
      starLabel,
      className,
      'data-testid': testIdProp,
      'aria-describedby': ariaDescribedBy,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
    },
    ref,
  ) => {
    const [current, setCurrent] = useControllableState(value, defaultValue, onChange);
    const marks = React.useRef<(HTMLButtonElement | null)[]>([]);
    const markLabel = labels?.mark ?? starLabel ?? DEFAULT_RATE_LABELS.mark;
    const testId = testIdProp || id;
    const locked = Boolean(disabled) || Boolean(readOnly);
    // The tab stop: the checked mark, or the first one while nothing is chosen.
    const stop = current >= 1 && current <= count ? current : 1;

    const choose = (next: number) => {
      if (locked) return;
      if (next === current) {
        if (allowClear) setCurrent(0);
        return;
      }
      setCurrent(next);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, mark: number) => {
      let next: number | undefined;
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(mark + 1, count);
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(mark - 1, 1);
      else if (event.key === 'Home') next = 1;
      else if (event.key === 'End') next = count;
      if (next === undefined) return;
      event.preventDefault();
      if (locked) return;
      marks.current[next - 1]?.focus();
      if (next !== current) setCurrent(next);
    };

    return (
      <div
        ref={ref}
        id={id}
        role="radiogroup"
        // Not a tab stop itself: focusing the group by id hands focus to the mark that holds the stop.
        tabIndex={-1}
        onFocus={(event) => {
          if (event.target === event.currentTarget) marks.current[stop - 1]?.focus();
        }}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        aria-readonly={readOnly || undefined}
        aria-disabled={disabled || undefined}
        data-testid={testId}
        data-slot="rate"
        data-size={size}
        data-state={disabled ? 'disabled' : readOnly ? 'readonly' : invalid ? 'invalid' : 'idle'}
        className={cn(
          'inline-flex w-fit items-center gap-1 rounded-[var(--oui-radius-field)] border border-transparent p-0.5 outline-none',
          'aria-invalid:border-[var(--oui-border-invalid)]',
          disabled && 'opacity-50',
          className,
        )}
      >
        {Array.from({ length: count }, (_, index) => {
          const mark = index + 1;
          return (
            // biome-ignore lint/a11y/useSemanticElements: a mark is an icon that clears on a second press; a native radio cannot uncheck
            <button
              key={mark}
              ref={(el) => {
                marks.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={mark === current}
              aria-label={markLabel(mark, count)}
              tabIndex={mark === stop ? 0 : -1}
              disabled={disabled}
              data-slot="rate-mark"
              data-filled={mark <= current}
              data-testid={testId ? `${testId}-mark-${mark}` : undefined}
              onClick={() => choose(mark)}
              onKeyDown={(event) => onKeyDown(event, mark)}
              className={rateMarkVariants({ size, filled: mark <= current, interactive: !locked })}
            >
              {icon}
            </button>
          );
        })}
        {name ? <input type="hidden" name={name} value={current} disabled={disabled} /> : null}
      </div>
    );
  },
);
RatePrimitiveInner.displayName = 'RatePrimitive';

export const RatePrimitive = React.memo(RatePrimitiveInner) as typeof RatePrimitiveInner;
