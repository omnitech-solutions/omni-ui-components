import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from './Breadcrumb';

const meta = {
  title: 'omni-ui-components/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The path to the current page: `items` with a `title` and an `href` or `onClick`; the last item is the current page. `separator` replaces the chevron.',
      },
    },
  },
} satisfies Meta<typeof Breadcrumb>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { title: 'Workspace', href: '#' },
      { title: 'Projects', href: '#' },
      { title: 'Brand refresh' },
    ],
  },
};

/** Any node separates the items. */
export const CustomSeparator: Story = {
  args: {
    separator: '/',
    items: [{ title: 'Settings', href: '#' }, { title: 'Team' }, { title: 'Roles' }],
  },
};
