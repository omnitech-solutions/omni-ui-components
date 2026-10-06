import { cva } from 'class-variance-authority';

export const settingRowVariants = cva('flex gap-3', {
  variants: {
    tone: {
      plain: '',
      boxed: 'rounded-xl border border-solid border-[color:var(--oui-panel-border)] bg-[color:var(--oui-panel-bg)] p-3.5',
      danger:
        'rounded-xl border border-solid border-[color:var(--oui-tone-danger-border)] bg-[color:var(--oui-tone-danger-bg)] p-3.5',
    },
    layout: {
      inline: 'items-center justify-between',
      stack: 'flex-col',
    },
  },
  defaultVariants: { tone: 'plain', layout: 'inline' },
});

export const SETTINGS_TAB_CLASS =
  'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] outline-none transition-colors hover:bg-[color:var(--oui-tone-neutral-bg)] focus-visible:ring-2 focus-visible:ring-ring/50 aria-selected:bg-[color:var(--oui-tone-accent-bg)] aria-selected:font-medium aria-selected:text-[color:var(--oui-tone-accent-fg)] motion-reduce:transition-none [&_svg]:size-4';
