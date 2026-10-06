import { cva } from 'class-variance-authority';

export const feedbackPanelClasses =
  'flex min-w-0 flex-col gap-2.5 rounded-xl border border-solid border-[color:var(--oui-panel-divider)] p-3 bg-[color:color-mix(in_srgb,var(--oui-panel-bg)_calc(var(--oui-panel-see-through,1)_*_100%),transparent)]';

/** A reason chip: outlined, accent tint when pressed. */
export const feedbackChipVariants = cva(
  [
    'h-7 cursor-pointer rounded-full border border-solid px-2.5 text-[12.5px] transition-colors',
    'border-[color:var(--oui-panel-divider)] bg-transparent text-[color:var(--oui-tone-neutral-fg)]',
    'hover:bg-[color:var(--oui-tone-accent-bg)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'aria-pressed:border-[color:var(--oui-tone-accent-border)] aria-pressed:bg-[color:var(--oui-tone-accent-bg)] aria-pressed:text-[color:var(--oui-tone-accent-fg)]',
  ].join(' '),
);
