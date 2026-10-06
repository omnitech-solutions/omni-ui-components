import { cva } from 'class-variance-authority';

/** A follow-up chip: quiet outline, accent tint on hover, left-aligned wrapping text. */
export const suggestionChipVariants = cva(
  [
    'inline-flex max-w-full cursor-pointer items-start gap-1.5 rounded-xl border border-solid px-2.5 py-1 text-start text-[12.5px] leading-[1.4]',
    'border-[color:var(--oui-panel-divider)] bg-transparent text-[color:var(--oui-tone-neutral-fg)] transition-colors',
    'hover:border-[color:var(--oui-tone-accent-border)] hover:bg-[color:var(--oui-tone-accent-bg)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:mt-0.5 [&_svg]:size-3.5 [&_svg]:flex-none',
  ].join(' '),
);
