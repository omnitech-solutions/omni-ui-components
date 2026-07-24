import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Rate } from '@oc-tech/omni-ui-components/Rate';

const meta: Meta<typeof Rate> = {
  title: 'omni-ui-components/Rate',
  component: Rate,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Star <primary>rating input</primary> with controlled and uncontrolled usage. Works for <primary>feedback, reviews, and scored evaluations</primary>.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Rate>;
export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState(3);
    return <Rate value={value} onChange={setValue} />;
  },
};

export const Disabled: Story = { args: { value: 4, disabled: true } };
