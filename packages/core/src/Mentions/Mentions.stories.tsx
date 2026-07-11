import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Mentions } from '@omnitech/omni-ui-core/Mentions';

const meta: Meta<typeof Mentions> = {
  title: 'omni-ui-components/Mentions',
  component: Mentions,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Mention-style multiline input built on the <primary>Omni textarea</primary>. Use it where <primary>Ant-compatible Mentions API coverage</primary> is needed.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Mentions>;
export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState('@alex please review this');
    return <Mentions label="Comment" value={value} onChange={setValue} />;
  },
};

export const Compact: Story = {
  render: () => {
    const [value, setValue] = React.useState('@jamie ');
    return <Mentions label="Internal note" rows={3} value={value} onChange={setValue} />;
  },
};
