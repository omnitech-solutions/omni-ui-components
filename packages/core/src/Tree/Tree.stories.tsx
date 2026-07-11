import type { Meta, StoryObj } from '@storybook/react';

import { Tree } from '@omnitech/omni-ui-core/Tree';

const meta: Meta<typeof Tree> = {
  title: 'omni-ui-components/Tree',
  component: Tree,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Expandable tree view for hierarchical navigation, nested record exploration, and file or settings structures. Use Tree when parent-child relationships should stay visible while the user progressively opens deeper levels.',
      },
    },
  },
  args: {
    treeData: [
      { key: '1', title: 'Workspace', children: [{ key: '1-1', title: 'Accounts' }, { key: '1-2', title: 'Billing' }] },
    ],
  },
};
export default meta;

type Story = StoryObj<typeof Tree>;
export const Default: Story = {};

export const MultiBranch: Story = {
  args: {
    treeData: [
      { key: '1', title: 'Workspace', children: [{ key: '1-1', title: 'Accounts' }, { key: '1-2', title: 'Billing' }] },
      { key: '2', title: 'Archive', children: [{ key: '2-1', title: '2025' }] },
    ],
  },
};

export const DeepHierarchy: Story = {
  args: {
    treeData: [
      {
        key: 'workspace',
        title: 'Workspace',
        children: [
          {
            key: 'releases',
            title: 'Releases',
            children: [
              { key: 'spring', title: 'Spring launch' },
              { key: 'summer', title: 'Summer campaign' },
            ],
          },
          {
            key: 'operations',
            title: 'Operations',
            children: [
              {
                key: 'approvals',
                title: 'Approvals',
                children: [{ key: 'pending', title: 'Pending items' }, { key: 'history', title: 'Review history' }],
              },
            ],
          },
        ],
      },
    ],
  },
};
