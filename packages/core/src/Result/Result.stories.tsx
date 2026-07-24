import type { Meta, StoryObj } from '@storybook/react';

import { Result } from '@oc-tech/omni-ui-components/Result';

const meta: Meta<typeof Result> = {
  title: 'omni-ui-components/Result',
  component: Result,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '<primary>Status-centric result surface</primary> for <primary>success, warning, error, and informational completion states</primary>.',
      },
    },
  },
  args: { status: 'success', title: 'Saved', subTitle: 'The record was saved successfully.' },
};
export default meta;

type Story = StoryObj<typeof Result>;
export const Default: Story = {};

export const Error: Story = { args: { status: 'error', title: 'Publishing failed', subTitle: 'Resolve validation issues and try again.' } };
