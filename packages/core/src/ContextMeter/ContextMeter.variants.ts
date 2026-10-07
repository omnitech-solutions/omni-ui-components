import { cva, type VariantProps } from 'class-variance-authority';

import type { ControlTone } from '../internal/support/controlTone';
import type { ContextLevel } from './ContextMeter.types';

/** The ring's tone per level (`Progress` ring tones). */
export const contextLevelTone: Record<ContextLevel, ControlTone> = {
  normal: 'accent',
  warn: 'warning',
  danger: 'danger',
};

/** The fill of the popover bar, per level. */
export const contextBarFillVariants = cva(
  'h-full rounded-full transition-[width] motion-reduce:transition-none',
  {
    variants: {
      level: {
        normal: 'bg-[color:var(--oui-tone-accent-solid-bg)]',
        warn: 'bg-[color:var(--oui-tone-warning-solid-bg)]',
        danger: 'bg-[color:var(--oui-tone-danger-solid-bg)]',
      } satisfies Record<ContextLevel, string>,
    },
    defaultVariants: { level: 'normal' },
  },
);
export type ContextBarFillVariantProps = VariantProps<typeof contextBarFillVariants>;

export const contextPopoverClasses = 'w-[280px] max-w-[calc(100vw-24px)] p-3 text-[13px]';
