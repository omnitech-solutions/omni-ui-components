import { cn } from 'lib/utils';
import * as React from 'react';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import type { SliderProps } from './Slider.types';
import { SliderPrimitive } from './SliderPrimitive';

/**
 * Chrome-wrapped Omni Slider. Composes {@link SliderPrimitive} with a
 * label / description / error stack via {@link FieldShell}.
 */
const SliderInner = React.forwardRef<HTMLSpanElement, SliderProps>(
  (
    {
      id: idProp,
      wrapperClassName,
      labelClassName,
      layout = 'vertical',
      label,
      description,
      error,
      required,
      invalid,
      className,
      showValue = true,
      formatValue,
      valueSuffix,
      value,
      defaultValue,
      ...primitiveProps
    },
    ref,
  ) => {
    const { id, isInvalid, descriptionId, errorId, requiredId, describedBy } = useFieldChrome({
      id: idProp,
      required,
      // The control cannot carry `aria-required`: it is described by a hidden "Required" hint instead.
      requiredHint: true,
      label,
      description,
      error,
      invalid,
      prefix: 'oui-slider',
    });

    const currentValue = value ?? defaultValue;
    const renderValue = (v: number): React.ReactNode => {
      if (formatValue) return formatValue(v);
      return `${v}${valueSuffix ?? ''}`;
    };
    const displayValue = Array.isArray(currentValue)
      ? currentValue.map(renderValue).join(' – ')
      : currentValue !== undefined
        ? renderValue(currentValue as number)
        : null;

    const labelContent = label ? (
      <>
        <span>{label}</span>
        {showValue && displayValue !== null ? (
          <span
            data-slot="slider-value"
            className="font-[family-name:var(--oui-font-sans)] text-xs font-medium tabular-nums text-[var(--oui-foreground-muted)]"
          >
            {displayValue}
          </span>
        ) : null}
      </>
    ) : null;

    return (
      <FieldShell
        id={id}
        layout={layout}
        label={labelContent}
        description={description}
        error={error}
        required={required}
        descriptionId={descriptionId}
        errorId={errorId}
        requiredId={requiredId}
        labelTag="span"
        labelId={labelContent ? `${id}-label` : undefined}
        wrapperClassName={cn(
          wrapperClassName,
          'cursor-pointer',
          layout === 'horizontal' && '[&_[data-disabled]]:cursor-not-allowed',
          layout === 'vertical' && 'gap-2',
        )}
        labelClassName={cn('flex items-baseline justify-between gap-3', labelClassName)}
      >
        <SliderPrimitive
          ref={ref}
          id={id}
          value={value}
          defaultValue={defaultValue}
          invalid={isInvalid}
          required={required}
          aria-labelledby={labelContent ? `${id}-label` : undefined}
          aria-describedby={describedBy}
          className={cn(layout === 'horizontal' && 'flex-1', className)}
          {...primitiveProps}
        />
      </FieldShell>
    );
  },
);
SliderInner.displayName = 'Slider';

export const Slider = React.memo(SliderInner) as typeof SliderInner;
