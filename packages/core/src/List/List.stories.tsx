import type { Meta, StoryObj } from '@storybook/react';

import { List, ListItem } from '@omnitech/omni-ui-core/List';

const meta: Meta<typeof List> = {
  title: 'omni-ui-components/List',
  component: List,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Simple <primary>bordered list container</primary> with row items. Works well for <primary>compact feeds, settings groups, and supporting lists</primary>.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof List>;
export const Default: Story = {
  render: () => (
    <List>
      <ListItem>Quarterly review</ListItem>
      <ListItem>Vendor sync</ListItem>
      <ListItem>Billing reconciliation</ListItem>
    </List>
  ),
};

export const Dense: Story = {
  render: () => (
    <List className="max-w-sm">
      <ListItem className="py-2">Alpha</ListItem>
      <ListItem className="py-2">Beta</ListItem>
      <ListItem className="py-2">Gamma</ListItem>
    </List>
  ),
};
