import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Tailwind class config for IconButton. Sizes track the Omni field
 * height scale (`--oui-field-height-*`) so IconButtons sit cleanly next
 * to Input / Select / Textarea rows.
 */
export const iconButtonVariants = cva(
  [
    'inline-flex items-center justify-center shrink-0',
    'rounded-[var(--oui-radius-field)]',
    'border bg-transparent cursor-pointer',
    'transition-[color,background-color,border-color,box-shadow]',
    'outline-none',
    'focus-visible:ring-2 focus-visible:ring-ring/50',
    'disabled:cursor-not-allowed disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:transition-colors',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: [
          'border-transparent bg-transparent text-red-600 dark:text-red-400',
          'hover:border-red-300 hover:bg-red-100',
          'focus-visible:border-red-300 focus-visible:bg-red-100',
          'dark:hover:border-red-500/40 dark:hover:bg-red-500/20',
          'dark:focus-visible:border-red-500/40 dark:focus-visible:bg-red-500/20',
        ].join(' '),
        outline: 'border-[var(--oui-border-field)] text-[var(--oui-foreground)] hover:border-[var(--oui-border-interactive)] hover:bg-muted/40',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'border-transparent text-[var(--oui-foreground-muted)] hover:bg-muted/40 hover:text-[var(--oui-foreground)]',
        link: 'border-transparent text-primary underline-offset-4 hover:underline',
      },
      iconSize: {
        sm: 'h-[var(--oui-field-height-sm)] w-[var(--oui-field-height-sm)] [&_svg]:size-3.5',
        default: 'h-[var(--oui-field-height-md)] w-[var(--oui-field-height-md)] [&_svg]:size-4',
        md: 'h-[var(--oui-field-height-lg)] w-[var(--oui-field-height-lg)] [&_svg]:size-4',
        lg: 'h-[var(--oui-field-height-xl)] w-[var(--oui-field-height-xl)] [&_svg]:size-5',
      },
    },
    defaultVariants: { variant: 'outline', iconSize: 'default' },
  },
);

export type IconButtonVariantProps = VariantProps<typeof iconButtonVariants>;
