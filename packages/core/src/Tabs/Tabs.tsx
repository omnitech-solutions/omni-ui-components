import { cn } from 'lib/utils';
import * as React from 'react';

import { TabsContent, TabsList, Tabs as TabsPrimitive, TabsTrigger } from '../components/ui/tabs';
import type { TabsContentProps, TabsListProps, TabsProps, TabsTriggerProps } from './Tabs.types';

export const Tabs = TabsPrimitive as React.FC<TabsProps>;

// The tab strip scrolls sideways when its tabs do not fit, with no scrollbar drawn: the tabs themselves show
// there is more, and the chosen one is always brought into view.
const SCROLLABLE =
  'max-w-full overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0';

const TabsListInner = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ scrollable = true, className, ...props }, ref) => {
    const own = React.useRef<HTMLDivElement | null>(null);
    React.useEffect(() => {
      const list = own.current;
      if (!scrollable || !list) return;
      const show = () =>
        list
          .querySelector<HTMLElement>('[role="tab"][data-state="active"]')
          ?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
      show();
      // The chosen tab changes by an attribute on a tab, whoever controls the tabs.
      const watching = new MutationObserver(show);
      watching.observe(list, { attributes: true, attributeFilter: ['data-state'], subtree: true });
      return () => watching.disconnect();
    }, [scrollable]);
    return (
      <TabsList
        ref={(node) => {
          own.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        data-scrollable={scrollable ? 'true' : undefined}
        className={cn(scrollable && SCROLLABLE, className)}
        {...props}
      />
    );
  },
);
TabsListInner.displayName = 'TabsList';

const TabsTriggerInner = React.forwardRef<HTMLButtonElement, TabsTriggerProps>((props, ref) => (
  <TabsTrigger ref={ref} {...props} />
));
TabsTriggerInner.displayName = 'TabsTrigger';

const TabsContentInner = React.forwardRef<HTMLDivElement, TabsContentProps>((props, ref) => (
  <TabsContent ref={ref} {...props} />
));
TabsContentInner.displayName = 'TabsContent';

export const TabsBar = React.memo(TabsListInner) as typeof TabsListInner;
export const Tab = React.memo(TabsTriggerInner) as typeof TabsTriggerInner;
export const TabPanel = React.memo(TabsContentInner) as typeof TabsContentInner;
