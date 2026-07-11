import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from 'lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'inline-flex min-h-11 items-center gap-1 rounded-xl border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] p-1 shadow-xs',
        className,
      )}
      {...props}
    />
  ),
);
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        [
          'inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-sm font-medium',
          'text-[var(--oui-foreground-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'hover:border-[var(--oui-border-field)] hover:bg-muted/30 hover:text-[var(--oui-foreground)]',
          'disabled:pointer-events-none disabled:opacity-50',
          'data-[state=active]:border-[var(--oui-border-interactive)] data-[state=active]:bg-background data-[state=active]:text-[var(--oui-foreground)] data-[state=active]:shadow-xs',
        ].join(' '),
        className,
      )}
      {...props}
    />
  ),
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        'mt-4 rounded-xl border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] p-5 text-[var(--oui-foreground)] shadow-xs focus-visible:outline-none',
        className,
      )}
      {...props}
    />
  ),
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
