import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Transfer } from '@oc-tech/omni-ui-components/Transfer';

const meta: Meta<typeof Transfer> = {
  title: 'omni-ui-components/Transfer',
  component: Transfer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '<primary>Dual-list transfer control</primary> for <primary>moving items between available and selected groups</primary>.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Transfer>;
export const Default: Story = {
  render: () => {
    const [targetKeys, setTargetKeys] = React.useState<string[]>(['2']);
    return (
      <Transfer
        dataSource={[
          { key: '1', title: 'Finance' },
          { key: '2', title: 'Engineering' },
          { key: '3', title: 'Operations' },
        ]}
        targetKeys={targetKeys}
        onChange={setTargetKeys}
      />
    );
  },
};

export const EmptyTarget: Story = {
  render: () => {
    const [targetKeys, setTargetKeys] = React.useState<string[]>([]);
    return (
      <Transfer
        dataSource={[
          { key: '1', title: 'Finance' },
          { key: '2', title: 'Engineering' },
          { key: '3', title: 'Operations' },
        ]}
        targetKeys={targetKeys}
        onChange={setTargetKeys}
      />
    );
  },
};
