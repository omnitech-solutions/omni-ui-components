import { cva } from 'class-variance-authority';

/**
 * The popover surface: an opaque panel above (or below) its relative parent. Opaque on purpose: it floats over
 * the log, so it uses the panel colour rather than the see-through mix.
 */
export const commandPopoverVariants = cva(
  [
    'absolute inset-x-0 z-20 flex max-h-64 flex-col overflow-hidden rounded-xl border border-solid border-[color:var(--oui-panel-border)]',
    'bg-[color:var(--oui-panel-bg)] text-[color:var(--oui-foreground)] shadow-lg',
  ].join(' '),
  {
    variants: { placement: { above: 'bottom-full mb-2', below: 'top-full mt-2' } },
    defaultVariants: { placement: 'above' },
  },
);

export const commandPopoverTitleClasses = 'px-3 pt-2 pb-1 text-[11px] font-medium tracking-wide text-[color:var(--oui-panel-meta-fg)] uppercase';
export const commandPopoverListClasses = 'flex min-h-0 flex-1 flex-col overflow-y-auto p-1';
export const commandPopoverOptionClasses = [
  'flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-2.5 py-1.5 text-left text-[13px] text-inherit outline-none',
  'aria-selected:bg-[color:var(--oui-tone-accent-bg)]',
  '[&_svg]:size-4 [&_svg]:flex-none',
].join(' ');
export const commandPopoverDescriptionClasses = 'min-w-0 flex-1 truncate text-xs text-[color:var(--oui-panel-meta-fg)]';
export const commandPopoverEmptyClasses = 'px-3 py-2 text-[13px] text-[color:var(--oui-panel-meta-fg)]';
export const commandPopoverHintClasses = 'border-t border-solid border-[color:var(--oui-panel-divider)] px-3 py-1.5 text-[11px] text-[color:var(--oui-panel-meta-fg)]';
