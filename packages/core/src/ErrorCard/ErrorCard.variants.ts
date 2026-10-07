import { cva } from 'class-variance-authority';

export const errorCardVariants = cva('flex min-w-0 gap-3 text-[13px]', {
  variants: {
    variant: {
      error:
        'rounded-[14px] border border-solid border-[color:var(--oui-tone-danger-border)] bg-[color:var(--oui-tone-danger-bg)] p-3.5',
      stopped: 'items-center gap-2 text-[color:var(--oui-panel-meta-fg)]',
    },
  },
  defaultVariants: { variant: 'error' },
});
