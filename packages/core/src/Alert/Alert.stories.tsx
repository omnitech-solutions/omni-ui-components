import type { Meta, StoryObj } from '@storybook/react';

import { Alert } from '@oc-tech/omni-ui-components/Alert';
import { alertPropsFactory } from 'factories/omni-ui-components/Alert/Alert.factories';

const meta: Meta<typeof Alert> = {
  title: 'omni-ui-components/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Inline alert banner for <primary>contextual system feedback</primary>, <primary>warnings</primary>, and success/error notices.',
      },
    },
  },
  args: alertPropsFactory(),
  argTypes: {
    variant: { control: 'inline-radio', options: ['info', 'success', 'warning', 'error', 'loading'] },
    size: { control: 'inline-radio', options: ['default', 'sm'] },
  },
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Default: Story = {};
export const Success: Story = { args: { variant: 'success', title: 'Saved', children: 'Your changes have been published.' } };
export const Warning: Story = { args: { variant: 'warning', title: 'Warning', children: 'This action cannot be undone.' } };
export const Error: Story = { args: { variant: 'error', title: 'Error', children: 'Please fix the highlighted issues.' } };
export const Loading: Story = { args: { variant: 'loading', title: 'Loading', children: 'Syncing records...' } };

export const Small: Story = { args: { size: 'sm', title: 'Compact', children: 'Dense inline alert treatment.' } };
