import { cva } from 'class-variance-authority';

/** The status dot beside the connection line, on the tone scale. */
export const modelsStatusVariants = cva('inline-block size-2 flex-none rounded-full', {
  variants: {
    status: {
      connected: 'bg-[color:var(--oui-tone-success-solid-bg)]',
      checking: 'bg-[color:var(--oui-tone-warning-solid-bg)]',
      disconnected: 'bg-[color:var(--oui-tone-danger-solid-bg)]',
    },
  },
  defaultVariants: { status: 'connected' },
});
