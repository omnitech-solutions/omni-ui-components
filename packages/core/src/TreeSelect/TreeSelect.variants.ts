import { cva } from 'class-variance-authority';

/** Classes the trigger adds on top of `inputVariants` (it is a button, not an input). */
export const treeSelectTriggerClasses = [
  'items-center justify-between gap-2 text-left cursor-pointer',
  'aria-readonly:cursor-default',
  'data-[placeholder=true]:text-[var(--oui-foreground-placeholder)]',
].join(' ');

/** One row of the popover tree. Indentation is set inline from the row's level. */
export const treeSelectItemVariants = cva(
  [
    'flex min-h-[var(--oui-field-height-md)] cursor-pointer select-none items-center gap-1.5',
    'rounded-[var(--oui-radius-field)] pr-2 text-sm outline-none',
    'font-[family-name:var(--oui-font-sans)] text-[var(--oui-foreground)]',
    'hover:bg-[color:var(--oui-tone-neutral-bg)]',
    'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2',
    'focus-visible:outline-[color:var(--oui-border-interactive)]',
    'aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-transparent',
  ].join(' '),
  {
    variants: {
      chosen: {
        true: 'bg-[color:var(--oui-segment-active-bg)] text-[color:var(--oui-segment-active-fg)] hover:bg-[color:var(--oui-segment-active-bg)]',
        false: '',
      },
    },
    defaultVariants: { chosen: false },
  },
);
