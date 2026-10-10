import { Menu } from '@oc-tech/omni-ui-components/Menu';
import type { Meta, StoryObj } from '@storybook/react';
import { NavigationMenu } from 'factories/omni-ui-components/Menu/Menu.factories';
import { Folder, Home, Settings } from 'lucide-react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { exampleDocs } from 'storybook-helpers/internal/support/exampleDocs';
import factories from './Menu.factories.tsx?raw';

const meta: Meta<typeof Menu> = {
  title: 'omni-ui-components/Menu',
  component: Menu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Hierarchical <primary>menu surface</primary> for <primary>side navigation and compact navigation groups</primary>. Items are typed data, generic over your own item type (<code>Menu&lt;T extends MenuItem&gt;</code>): an item with `href` is an anchor, `indicator` is a named dot, `shortcut` draws keys, `disabledReason` disables it and says why, `type: "group"` draws a label over its children and `type: "divider"` a rule. The current item (`selectedKeys`) carries `aria-current="page"`. <primary>onSelect(item)</primary> fires with the full item; the menu never navigates, and returning `false` keeps the click from an anchor so a router can take it. `collapsed` shows icons only, with the label as a tooltip and still the accessible name. `appearance="plain"` drops the card for use inside a `Sider`; `size="compact"` tightens the rows; `label` wraps the list in a named `<nav>`.',
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

const onNavigate = fn();

/** Plain appearance in a named `<nav>`: links, an indicator, shortcuts, a disabled item with its reason, a divider and a group. */
export const Navigation: Story = {
  render: () => (
    <div style={{ width: 260 }}>
      <NavigationMenu onNavigate={onNavigate} />
    </div>
  ),
  parameters: exampleDocs(factories, 'NavigationMenu'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onNavigate.mockClear();
    await expect(canvas.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: /Home/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await userEvent.click(canvas.getByRole('link', { name: /Inbox/ }));
    await expect(onNavigate).toHaveBeenCalledWith('/inbox');
    await expect(canvas.getByRole('link', { name: /Inbox/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await userEvent.click(canvas.getByRole('link', { name: /Reports/ }));
    await expect(onNavigate).toHaveBeenCalledTimes(1);
  },
};

/** Icons only: each label is a tooltip and is still the item's accessible name. */
export const Collapsed: Story = {
  render: () => (
    <div style={{ width: 56 }}>
      <NavigationMenu collapsed onNavigate={onNavigate} />
    </div>
  ),
  parameters: exampleDocs(factories, 'NavigationMenu'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('link', { name: /People/ }));
    await expect(canvas.getByRole('link', { name: /People/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};
