import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Colour per state, from the tone tokens. Only the icon, the timer and the paused label change:
 * the clock has no surface of its own in either state.
 */
export const statusClockVariants = cva('inline-flex min-w-0 max-w-full items-center gap-2.5', {
  variants: { state: { live: '', paused: '' } },
  defaultVariants: { state: 'live' },
});

export const statusClockIconVariants = cva('inline-flex size-5 flex-none items-center justify-center [&_svg]:size-5', {
  variants: {
    state: {
      live: 'text-[color:var(--oui-clock-live)]',
      paused: 'text-[color:var(--oui-clock-paused-icon)]',
    },
  },
  defaultVariants: { state: 'live' },
});

export const statusClockTimerVariants = cva('flex-none font-mono text-[15px] font-semibold tabular-nums', {
  variants: {
    state: {
      live: 'text-[color:var(--oui-clock-live)]',
      paused: 'text-[color:var(--oui-clock-paused)]',
    },
  },
  defaultVariants: { state: 'live' },
});

export type StatusClockVariantProps = VariantProps<typeof statusClockVariants>;
