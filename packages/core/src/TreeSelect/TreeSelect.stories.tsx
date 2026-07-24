import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { TreeSelect } from '@oc-tech/omni-ui-components/TreeSelect';

const meta: Meta<typeof TreeSelect> = {
  title: 'omni-ui-components/TreeSelect',
  component: TreeSelect,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Select input that flattens <primary>tree-shaped data</primary> into a <primary>hierarchical option list</primary> for Ant-compatible TreeSelect usage.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof TreeSelect>;
export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState('billing');
    return (
      <TreeSelect
        label="Department"
        value={value}
        onChange={setValue}
        treeData={[{ value: 'workspace', title: 'Workspace', children: [{ value: 'accounts', title: 'Accounts' }, { value: 'billing', title: 'Billing' }] }]}
      />
    );
  },
};

export const Placeholder: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <TreeSelect
        label="Location"
        placeholder="Choose a node"
        value={value}
        onChange={setValue}
        treeData={[{ value: 'na', title: 'North America', children: [{ value: 'ca', title: 'Canada' }, { value: 'us', title: 'United States' }] }]}
      />
    );
  },
};
