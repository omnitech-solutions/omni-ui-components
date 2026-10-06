/**
 * The footer surface. It is the same in every session state: the panel colour (mixed with the see-through
 * token on the background only), the panel border and radius. Written out in full for Tailwind's scan.
 */
export const SESSION_BAR_SURFACE = [
  'box-border min-h-[52px] px-4 py-[7px]',
  'rounded-[var(--oui-panel-radius)] border border-solid border-[color:var(--oui-panel-border)]',
  'bg-[color:color-mix(in_srgb,var(--oui-panel-bg)_calc(var(--oui-panel-see-through,1)_*_100%),transparent)]',
  'text-[color:var(--oui-tone-neutral-fg)]',
].join(' ');
