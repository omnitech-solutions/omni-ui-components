import type { Meta, StoryObj } from '@storybook/react';

import { Statistic } from '@omnitech/omni-ui-core/Statistic';

const meta: Meta<typeof Statistic> = {
  title: 'omni-ui-components/Statistic',
  component: Statistic,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Prominent <primary>numeric readout</primary> for <primary>KPIs, rollups, and dashboard metrics</primary>. Supports title, prefix, and suffix content.',
      },
    },
  },
  args: { title: 'ARR', value: '$1.24M' },
};
export default meta;

type Story = StoryObj<typeof Statistic>;
export const Default: Story = {};

export const WithSuffix: Story = { args: { title: 'Conversion', value: 18.2, suffix: '%' } };
