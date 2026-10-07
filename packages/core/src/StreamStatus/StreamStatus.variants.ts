import { cva, type VariantProps } from 'class-variance-authority';

export const streamStatusVariants = cva('inline-flex items-center gap-2 text-[13px]', {
  variants: {
    tone: {
      neutral: 'text-[color:var(--oui-foreground-muted)]',
      success: 'text-[color:var(--oui-tone-success-fg)]',
      danger: 'text-[color:var(--oui-tone-danger-fg)]',
      warning: 'text-[color:var(--oui-tone-warning-fg)]',
    },
  },
  defaultVariants: { tone: 'neutral' },
});
export type StreamStatusVariantProps = VariantProps<typeof streamStatusVariants>;

export const streamStatusPulseClasses = 'animate-pulse motion-reduce:animate-none';
export const streamStatusTimerClasses = 'tabular-nums opacity-80';
