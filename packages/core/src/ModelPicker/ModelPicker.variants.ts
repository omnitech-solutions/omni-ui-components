/** The menu surface; the library popover supplies position, portal and animation. */
export const modelMenuClasses = 'w-[340px] max-w-[calc(100vw-24px)] max-h-[70vh] overflow-y-auto p-1.5 text-[13px]';

export const modelGroupLabelClasses =
  'flex items-center gap-1.5 px-2.5 pt-2 pb-1 text-[11.5px] font-medium text-[color:var(--oui-panel-meta-fg)]';

export const modelRowClasses = [
  'flex w-full cursor-pointer items-start gap-2 rounded-lg border border-transparent bg-transparent px-2.5 py-2 text-left',
  'hover:bg-[color:var(--oui-tone-neutral-bg)]',
  'aria-pressed:bg-[color:var(--oui-tone-accent-bg)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
].join(' ');

export const modelTagClasses =
  'rounded-full bg-[color:var(--oui-panel-dock-bg)] px-1.5 py-px text-[10.5px] leading-4 text-[color:var(--oui-panel-meta-fg)]';

export const modelChipClasses = 'max-w-[220px] gap-1 px-2 text-[12.5px] font-medium text-[color:var(--oui-panel-meta-fg)] [&_svg]:size-3.5';
