'use client';

import * as React from 'react';
import { Root, Indicator, Item } from '@radix-ui/react-radio-group';
import { CircleIcon } from 'lucide-react';

import { cn } from 'lib/utils';

/**
 * Shadcn-style RadioGroup root + item primitives. Omni wraps these in
 * `omni-ui-components/Radio` — feature code should import from there,
 * not directly.
 */
function RadioGroup({ className, ...props }: React.ComponentProps<typeof Root>) {
  return <Root data-slot="radio-group" className={cn('grid gap-3', className)} {...props} />;
}

function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof Item>) {
  return (
    <Item
      data-slot="radio-group-item"
      className={cn(
        'border-muted-foreground/60 text-primary focus-visible:border-ring focus-visible:ring-ring/50',
        'hover:border-muted-foreground',
        'data-[state=checked]:border-primary',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        'aspect-square size-[18px] shrink-0 rounded-full border-2 bg-transparent cursor-pointer',
        'transition-[color,box-shadow,border-color] outline-none focus-visible:ring-[3px]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <Indicator data-slot="radio-group-indicator" className="relative flex items-center justify-center">
        <CircleIcon className="fill-primary text-primary absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2" />
      </Indicator>
    </Item>
  );
}

export { RadioGroup, RadioGroupItem };
