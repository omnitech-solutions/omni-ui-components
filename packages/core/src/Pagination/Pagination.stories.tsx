import type { Meta, StoryObj } from '@storybook/react';

import { Pagination } from '@oc-tech/omni-ui-components/Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'omni-ui-components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Page navigation control for paged datasets. The Omni implementation uses the same field-surface treatment as form controls so pagination feels native beside tables, filters, and settings panels.',
      },
    },
  },
  args: { current: 2, total: 50, pageSize: 10 },
};
export default meta;

type Story = StoryObj<typeof Pagination>;
export const Default: Story = {};

export const FirstPage: Story = { args: { current: 1, total: 25, pageSize: 5 } };

export const WithSizeChanger: Story = {
  args: {
    current: 3,
    total: 120,
    pageSize: 20,
    showSizeChanger: true,
    pageSizeOptions: [10, 20, 50],
  },
};
