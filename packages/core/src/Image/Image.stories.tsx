import type { Meta, StoryObj } from '@storybook/react';

import { Image } from '@omnitech/omni-ui-core/Image';

const meta: Meta<typeof Image> = {
  title: 'omni-ui-components/Image',
  component: Image,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Responsive <primary>image wrapper</primary> with light styling defaults for <primary>documentation, cards, and media previews</primary>.',
      },
    },
  },
  args: {
    src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    alt: 'Landscape',
  },
};
export default meta;

type Story = StoryObj<typeof Image>;
export const Default: Story = {};

export const RoundedHero: Story = { args: { className: 'h-56 w-full object-cover rounded-xl' } };
