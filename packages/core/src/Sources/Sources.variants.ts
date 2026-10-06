import { cva } from 'class-variance-authority';

/** A source chip: number badge, title, quiet meta. Pressed = its card is open. */
export const sourceChipVariants = cva(
  [
    'inline-flex max-w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-full border border-solid py-0.5 ps-1 pe-2.5 text-[12px] leading-[1.4]',
    'border-[color:var(--oui-panel-divider)] bg-transparent text-[color:var(--oui-tone-neutral-fg)] transition-colors',
    'hover:bg-[color:var(--oui-tone-accent-bg)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'aria-pressed:border-[color:var(--oui-tone-accent-border)] aria-pressed:bg-[color:var(--oui-tone-accent-bg)]',
  ].join(' '),
);

export const sourceNumberClasses =
  'inline-flex h-4 min-w-4 flex-none items-center justify-center rounded-full bg-[color:var(--oui-tone-accent-bg)] px-1 text-[10.5px] font-semibold text-[color:var(--oui-tone-accent-fg)]';

/** The open card: panel colour, panel divider, a quotation under the head row. */
export const sourceCardClasses =
  'mt-2 rounded-lg border border-solid border-[color:var(--oui-panel-divider)] bg-[color:color-mix(in_srgb,var(--oui-panel-dock-bg)_calc(var(--oui-panel-see-through,1)_*_100%),transparent)] px-3 py-2 text-[12.5px]';
