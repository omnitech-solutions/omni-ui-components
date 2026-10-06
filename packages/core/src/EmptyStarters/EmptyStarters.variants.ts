import { cva } from 'class-variance-authority';

export const starterGridVariants = cva('grid w-full max-w-[560px] gap-2', {
  variants: {
    columns: { 1: 'grid-cols-1', 2: 'grid-cols-1 sm:grid-cols-2', 3: 'grid-cols-1 sm:grid-cols-3' },
  },
  defaultVariants: { columns: 2 },
});

export const STARTER_CARD_CLASS =
  'flex min-w-0 flex-col items-start gap-1 rounded-xl border border-solid border-[color:var(--oui-panel-border)] bg-[color:var(--oui-panel-bg)] p-3 text-left outline-none transition-colors hover:border-[color:var(--oui-tone-accent-border)] hover:bg-[color:var(--oui-tone-accent-bg)] focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:transition-none';
