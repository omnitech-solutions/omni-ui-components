import { cva } from 'class-variance-authority';

/** The status dot beside a row's detail, on the tone scale. */
export const integrationStatusVariants = cva('inline-block size-2 flex-none rounded-full', {
  variants: {
    status: {
      connected: 'bg-[color:var(--oui-tone-success-solid-bg)]',
      unreachable: 'bg-[color:var(--oui-tone-danger-solid-bg)]',
      off: 'bg-[color:var(--oui-tone-dim-border)]',
      other: 'bg-[color:var(--oui-tone-warning-solid-bg)]',
    },
  },
  defaultVariants: { status: 'off' },
});
