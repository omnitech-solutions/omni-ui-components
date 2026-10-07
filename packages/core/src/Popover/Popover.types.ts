import type * as PopoverPrimitive from '@radix-ui/react-popover';
import type * as React from 'react';

export type PopoverProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>;
export type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>;
export type PopoverAnchorProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Anchor>;
export type PopoverContentProps = React.ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Content
> & {
  /** Portal target; default `document.body`. Lets a native host render the surface inside its own root. */
  container?: HTMLElement | null;
};
