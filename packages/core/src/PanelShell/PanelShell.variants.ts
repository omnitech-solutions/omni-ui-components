import { cva } from 'class-variance-authority';

/** The assistant surface: the panel look of the library Panel (radius, border, background), as a flex column. */
export const panelShellSurfaceVariants = cva(
  'relative box-border flex min-h-0 min-w-0 overflow-hidden border border-solid border-[color:var(--oui-panel-border)] bg-[color:var(--oui-panel-bg)] text-[color:var(--oui-tone-neutral-fg)]',
  {
    variants: {
      mode: {
        panel: 'flex-none rounded-[var(--oui-panel-radius)]',
        full: 'flex-1 rounded-[var(--oui-panel-radius)]',
      },
    },
    defaultVariants: { mode: 'panel' },
  },
);
