import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Tailwind class config for the Omni Button. Mirrors the shadcn
 * Button API (variant × size) but routes colors through Omni tokens
 * + Tailwind palette so the look matches the rest of omni-ui-components.
 */
export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-[var(--oui-radius-field)]',
    'font-[family-name:var(--oui-font-sans)] text-sm font-medium',
    'cursor-pointer ring-offset-background',
    'transition-[color,background-color,border-color,box-shadow]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-red-600 text-white hover:bg-red-600/90 dark:bg-red-500 dark:hover:bg-red-500/90',
        outline:
          'border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] text-[var(--oui-foreground)] shadow-xs hover:border-[var(--oui-border-interactive)] hover:bg-muted/40',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'bg-transparent text-[var(--oui-foreground)] hover:bg-muted/40',
        link: 'bg-transparent text-primary underline-offset-4 hover:underline',
      },
      buttonSize: {
        sm: 'h-[var(--oui-field-height-sm)] px-3 text-xs',
        default: 'h-[var(--oui-field-height-md)] px-4 py-2',
        md: 'h-[var(--oui-field-height-lg)] px-5 py-2',
        lg: 'h-[var(--oui-field-height-xl)] px-6 text-base',
        icon: 'h-[var(--oui-field-height-md)] w-[var(--oui-field-height-md)]',
      },
    },
    defaultVariants: { variant: 'default', buttonSize: 'default' },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
export type ButtonVariant = NonNullable<ButtonVariantProps['variant']>;
export type ButtonSize = NonNullable<ButtonVariantProps['buttonSize']>;
