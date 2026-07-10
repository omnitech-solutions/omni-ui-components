import * as React from 'react';
import { ToggleGroup, ToggleGroupItem } from 'components/ui/toggle-group';

import { cn } from 'lib/utils';
import type { SegmentedPrimitiveProps } from './Segmented.types';

/**
 * Raw Omni Segmented primitive — a single-select pill row built on
 * Radix `ToggleGroup`. Selected option uses `bg-primary` + white text;
 * the row itself is a rounded-full muted pill so the active segment
 * "pops" through.
 *
 * Defaults: single-select. Whole control is keyboard-friendly (Left /
 * Right move selection inside the group).
 */
const SegmentedPrimitiveInner = React.forwardRef<HTMLDivElement, SegmentedPrimitiveProps>(
  ({ id, name: _name, className, options, value, defaultValue, onChange, disabled, required, invalid, 'aria-describedby': ariaDescribedBy, ...rest }, ref) => {
    const restAny = rest as Record<string, unknown>;
    const testId = typeof restAny['data-testid'] === 'string' && restAny['data-testid'].length > 0 ? (restAny['data-testid'] as string) : id;

    return (
      <ToggleGroup
        ref={ref}
        type="single"
        value={value ?? ''}
        defaultValue={defaultValue}
        disabled={disabled}
        onValueChange={(v: string) => {
          /* Radix lets the user "deselect" by clicking the active item.
           * Omni Segmented is conceptually a required single-select, so
           * we ignore empty-string transitions. */
          if (v) onChange?.(v);
        }}
        data-testid={testId}
        data-slot="segmented"
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        aria-describedby={ariaDescribedBy}
        className={cn('inline-flex w-fit gap-1 rounded-full border border-[var(--oui-border-field)] bg-muted/40 p-1', className)}
      >
        {options.map((opt) => (
          <ToggleGroupItem
            key={opt.value}
            value={opt.value}
            aria-label={typeof opt.label === 'string' ? opt.label : undefined}
            disabled={disabled || opt.disabled}
            data-testid={testId ? `${testId}-option-${opt.value}` : undefined}
            className={cn(
              'h-8 rounded-full px-4 text-sm font-medium cursor-pointer',
              'text-[var(--oui-foreground)] hover:bg-muted/60',
              'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-colors',
            )}
          >
            {opt.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    );
  },
);
SegmentedPrimitiveInner.displayName = 'SegmentedPrimitive';

export const SegmentedPrimitive = React.memo(SegmentedPrimitiveInner) as typeof SegmentedPrimitiveInner;
