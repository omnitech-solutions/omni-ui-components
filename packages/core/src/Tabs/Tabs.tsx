import * as React from 'react';

import { Tabs as TabsPrimitive, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import type { TabsContentProps, TabsListProps, TabsProps, TabsTriggerProps } from './Tabs.types';

export const Tabs = TabsPrimitive as React.FC<TabsProps>;

const TabsListInner = React.forwardRef<HTMLDivElement, TabsListProps>((props, ref) => <TabsList ref={ref} {...props} />);
TabsListInner.displayName = 'TabsList';

const TabsTriggerInner = React.forwardRef<HTMLButtonElement, TabsTriggerProps>((props, ref) => <TabsTrigger ref={ref} {...props} />);
TabsTriggerInner.displayName = 'TabsTrigger';

const TabsContentInner = React.forwardRef<HTMLDivElement, TabsContentProps>((props, ref) => <TabsContent ref={ref} {...props} />);
TabsContentInner.displayName = 'TabsContent';

export const TabsBar = React.memo(TabsListInner) as typeof TabsListInner;
export const Tab = React.memo(TabsTriggerInner) as typeof TabsTriggerInner;
export const TabPanel = React.memo(TabsContentInner) as typeof TabsContentInner;
