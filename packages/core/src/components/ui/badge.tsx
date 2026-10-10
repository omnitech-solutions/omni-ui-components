import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'lib/utils';
import type * as React from 'react';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          // Dark theme: `--color-destructive` is a light coral there (it is also text), so the fill is the solid danger tone.
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 dark:bg-[color:var(--oui-tone-danger-solid-bg)] dark:hover:bg-[color:var(--oui-tone-danger-solid-bg)]',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
