import * as React from 'react';
import { Slider as ShadcnSlider } from 'components/ui/slider';

import { cn } from 'lib/utils';
import type { SliderPrimitiveProps } from './Slider.types';

/**
 * Raw Omni Slider primitive. Wraps `components/ui/slider` (Radix
 * Slider) so the Omni wrapper can stay theme-token-aware while the
 * track/thumb visuals match shadcn defaults (primary-tinted track,
 * primary-bordered thumb).
 *
 * Accepts single (number) or range (number[]) values; normalizes both
 * directions at the Radix boundary.
 */
const SliderPrimitiveInner = React.forwardRef<HTMLSpanElement, SliderPrimitiveProps>(
  (
    {
      id,
      name,
      className,
      value,
      defaultValue,
      onChange,
      onValueCommit,
      min = 0,
      max = 100,
      step = 1,
      disabled,
      required,
      invalid,
      orientation = 'horizontal',
      inverted,
      minStepsBetweenThumbs,
      'aria-describedby': ariaDescribedBy,
      'aria-label': ariaLabel,
      ...rest
    },
    _ref,
  ) => {
    const restAny = rest as Record<string, unknown>;
    const testId = typeof restAny['data-testid'] === 'string' && restAny['data-testid'].length > 0 ? (restAny['data-testid'] as string) : id;

    const toArray = (v: number | number[] | undefined): number[] | undefined => (v === undefined ? undefined : Array.isArray(v) ? v : [v]);

    const valueArr = toArray(value);
    const defaultValueArr = toArray(defaultValue);
    const isRange = (valueArr ?? defaultValueArr ?? []).length > 1;

    const handleChange = (next: number[]) => onChange?.(isRange ? next : (next[0] as number));
    const handleCommit = (next: number[]) => onValueCommit?.(isRange ? next : (next[0] as number));

    return (
      <ShadcnSlider
        name={name}
        value={valueArr}
        defaultValue={defaultValueArr}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        orientation={orientation}
        inverted={inverted}
        minStepsBetweenThumbs={minStepsBetweenThumbs}
        onValueChange={handleChange}
        onValueCommit={handleCommit}
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        id={id}
        data-testid={testId}
        className={cn(className)}
      />
    );
  },
);
SliderPrimitiveInner.displayName = 'SliderPrimitive';

export const SliderPrimitive = React.memo(SliderPrimitiveInner) as typeof SliderPrimitiveInner;
