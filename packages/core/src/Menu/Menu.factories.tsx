import type { MenuItem } from '@oc-tech/omni-ui-components/Menu';
import { Menu } from '@oc-tech/omni-ui-components/Menu';
import { BarChart3, FileText, Home, Inbox, Settings, Users } from 'lucide-react';
import * as React from 'react';

/** A menu item that carries where it leads: the extra field reaches `onSelect` untouched. */
export interface RouteItem extends MenuItem {
  path?: string;
  children?: RouteItem[];
}

const icon = 'h-4 w-4';

export const routeItems: RouteItem[] = [
  {
    key: 'home',
    label: 'Home',
    icon: <Home className={icon} />,
    href: '/home',
    path: '/home',
    shortcut: ['G', 'H'],
  },
  {
    key: 'inbox',
    label: 'Inbox',
    icon: <Inbox className={icon} />,
    href: '/inbox',
    path: '/inbox',
    shortcut: ['G', 'I'],
    indicator: { label: '3 unread', tone: 'accent' },
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: <BarChart3 className={icon} />,
    href: '/reports',
    path: '/reports',
    disabledReason: 'Reports open once a first record exists',
  },
  { key: 'rule', label: '', type: 'divider' },
  {
    key: 'workspace',
    label: 'Workspace',
    type: 'group',
    children: [
      {
        key: 'people',
        label: 'People',
        icon: <Users className={icon} />,
        href: '/people',
        path: '/people',
      },
      {
        key: 'documents',
        label: 'Documents',
        icon: <FileText className={icon} />,
        href: '/documents',
        path: '/documents',
      },
      {
        key: 'settings',
        label: 'Settings',
        icon: <Settings className={icon} />,
        path: '/settings',
      },
    ],
  },
];

/**
 * Side navigation from typed data. The menu never navigates: `onSelect` gets the full item, the host moves to
 * `item.path` with its own router and returns `false` so the anchor's own navigation does not also run.
 */
export const NavigationMenu: React.FC<{
  collapsed?: boolean;
  onNavigate?: (path: string) => void;
}> = ({ collapsed = false, onNavigate }) => {
  const [current, setCurrent] = React.useState<React.Key>('home');
  return (
    <Menu<RouteItem>
      label="Main navigation"
      appearance="plain"
      collapsed={collapsed}
      items={routeItems}
      selectedKeys={[current]}
      onSelect={(item) => {
        setCurrent(item.key);
        if (item.path) onNavigate?.(item.path);
        return false;
      }}
    />
  );
};
