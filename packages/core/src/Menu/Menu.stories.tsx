import type { Meta, StoryObj } from '@storybook/react';
import { Folder, Home, Settings } from 'lucide-react';

import { Menu } from '@omnitech/omni-ui-core/Menu';

const meta: Meta<typeof Menu> = {
  title: 'omni-ui-components/Menu',
  component: Menu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Hierarchical <primary>menu surface</primary> for <primary>side navigation and compact navigation groups</primary>. Supports icons, nesting, and selected states.',
      },
    },
  },
  args: {
    selectedKeys: ['home'],
    items: [
      { key: 'home', label: 'Home', icon: <Home className="h-4 w-4" /> },
      {
        key: 'projects',
        label: 'Projects',
        icon: <Folder className="h-4 w-4" />,
        children: [
          { key: 'active-projects', label: 'Active projects' },
          { key: 'archived-projects', label: 'Archived projects' },
        ],
      },
      { key: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
    ],
  },
};
export default meta;

type Story = StoryObj<typeof Menu>;
export const Default: Story = {};

export const Nested: Story = {
  args: {
    selectedKeys: ['billing'],
    items: [
      {
        key: 'workspace',
        label: 'Workspace',
        children: [
          { key: 'accounts', label: 'Accounts' },
          { key: 'billing', label: 'Billing' },
        ],
      },
      { key: 'settings', label: 'Settings' },
    ],
  },
};

export const DeepHierarchy: Story = {
  args: {
    selectedKeys: ['receivables'],
    items: [
      {
        key: 'operations',
        label: 'Operations',
        children: [
          {
            key: 'finance',
            label: 'Finance',
            children: [
              { key: 'payables', label: 'Payables' },
              { key: 'receivables', label: 'Receivables' },
            ],
          },
          { key: 'people', label: 'People' },
        ],
      },
      { key: 'reports', label: 'Reports' },
    ],
  },
};
