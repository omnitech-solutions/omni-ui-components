import { cva } from 'class-variance-authority';

export const approvalCardVariants = cva(
  'flex min-w-0 flex-col gap-3 rounded-[14px] border border-solid p-3.5 bg-[color:color-mix(in_srgb,var(--oui-panel-bg)_calc(var(--oui-panel-see-through,1)_*_100%),transparent)]',
  {
    variants: {
      status: {
        pending: 'border-[color:var(--oui-tone-warning-border)]',
        once: 'border-[color:var(--oui-panel-divider)]',
        always: 'border-[color:var(--oui-panel-divider)]',
        denied: 'border-[color:var(--oui-panel-divider)]',
      },
    },
    defaultVariants: { status: 'pending' },
  },
);

/** The shield badge: warning tint while pending is the caller's choice of icon; the tile is always warning-tinted. */
export const approvalBadgeClasses =
  'flex size-8 flex-none items-center justify-center rounded-[9px] bg-[color:var(--oui-tone-warning-bg)] text-[color:var(--oui-tone-warning-fg)] [&_svg]:size-[18px]';
