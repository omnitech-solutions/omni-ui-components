import type * as TabsPrimitive from '@radix-ui/react-tabs';
import type * as React from 'react';

export type TabsProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>;
export type TabsListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
  /**
   * Tabs that do not fit the bar's width are reached by scrolling it sideways, and the chosen tab is brought
   * into view. On by default; `false` lets the bar grow past what holds it.
   */
  scrollable?: boolean;
};
export type TabsTriggerProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>;
export type TabsContentProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>;
