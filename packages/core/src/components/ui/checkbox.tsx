import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

import { cn } from 'lib/utils';

// shadcn/ui Checkbox scaffold. Two roles:
//
// 1. Default styled `Checkbox` — Tailwind-class checkbox for direct shadcn-
//    style usage on new surfaces that don't need bridge CSS parity.
// 2. Re-exported `CheckboxPrimitive` — the underlying Radix primitive
//    (Root + Indicator). The Omni wrapper at `components/Checkbox.tsx`
//    composes these directly for visual parity with the legacy `.checkbox-toggle`
//    bridge CSS, rather than the Tailwind defaults below.
//
// Routing the Omni wrapper through this re-export (rather than importing
// `@radix-ui/react-checkbox` directly) keeps the Radix dependency edge in
// one place — version bumps and patches go here.

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        'grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn('grid place-content-center text-current')}>
        <Check className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  ),
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox, CheckboxPrimitive };
