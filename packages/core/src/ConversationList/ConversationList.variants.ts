import { cva } from 'class-variance-authority';

/** The navigation shell: docked sits beside the conversation with a divider, overlay floats over it with a shadow. */
export const conversationListVariants = cva(
  'box-border flex min-h-0 flex-col overflow-hidden bg-[color:var(--oui-panel-dock-bg)] text-[color:var(--oui-tone-neutral-fg)]',
  {
    variants: {
      docked: {
        true: 'h-full w-full border-r border-solid border-[color:var(--oui-panel-divider)]',
        false: 'h-full w-full rounded-[var(--oui-panel-radius)] border border-solid border-[color:var(--oui-panel-border)] shadow-xl',
      },
    },
    defaultVariants: { docked: true },
  },
);

/** One conversation row. The open row keeps a tinted background. */
export const conversationRowVariants = cva(
  'group/row relative flex items-center gap-0.5 rounded-lg px-1 transition-colors hover:bg-[color:var(--oui-tone-neutral-bg)] focus-within:bg-[color:var(--oui-tone-neutral-bg)]',
  {
    variants: {
      active: { true: 'bg-[color:var(--oui-tone-accent-bg)] hover:bg-[color:var(--oui-tone-accent-bg)]', false: '' },
    },
    defaultVariants: { active: false },
  },
);

/** The hover action cluster: collapsed (but still focusable) until the row is hovered or focused. */
export const ROW_ACTIONS_CLASS =
  'flex flex-none items-center overflow-hidden max-w-0 opacity-0 transition-[max-width,opacity] motion-reduce:transition-none group-hover/row:max-w-24 group-hover/row:opacity-100 group-focus-within/row:max-w-24 group-focus-within/row:opacity-100 [@media(hover:none)]:max-w-24 [@media(hover:none)]:opacity-100';
