import type * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type * as React from 'react';

export type TooltipProviderProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>;
export type TooltipProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>;
export type TooltipTriggerProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>;
export type TooltipContentProps = React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
> & {
  /** Portal target; default `document.body`. Lets a native host render the surface inside its own root. */
  container?: HTMLElement | null;
};
