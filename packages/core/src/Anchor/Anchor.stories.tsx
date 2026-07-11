import type { Meta, StoryObj } from '@storybook/react';

import { Anchor } from '@omnitech/omni-ui-core/Anchor';

const meta: Meta<typeof Anchor> = {
  title: 'omni-ui-components/Anchor',
  component: Anchor,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Renders a compact list of <primary>in-page navigation links</primary>. Use it for <primary>section indexes, side navigation, and long-form documentation layouts</primary>.',
      },
    },
  },
  args: {
    items: [
      { href: '#overview', title: 'Overview' },
      { href: '#details', title: 'Details' },
      { href: '#activity', title: 'Activity' },
    ],
  },
};
export default meta;

type Story = StoryObj<typeof Anchor>;
export const Default: Story = {};

export const DenseList: Story = {
  args: {
    items: [
      { href: '#summary', title: 'Summary' },
      { href: '#owners', title: 'Owners' },
      { href: '#billing', title: 'Billing' },
      { href: '#audit', title: 'Audit trail' },
    ],
  },
};
