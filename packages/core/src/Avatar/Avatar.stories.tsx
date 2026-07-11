import type { Meta, StoryObj } from '@storybook/react';

import { Avatar } from '@omnitech/omni-ui-core/Avatar';
import { avatarPropsFactory } from 'factories/omni-ui-components/Avatar/Avatar.factories';

const meta: Meta<typeof Avatar> = {
  title: 'omni-ui-components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Avatar primitive with <primary>image and fallback support</primary> for <primary>people, teams, and lightweight identity markers</primary>.',
      },
    },
  },
  args: avatarPropsFactory(),
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};
export const Image: Story = {
  args: {
    src: 'https://i.pravatar.cc/80?img=12',
    alt: 'Avatar preview',
    fallback: 'AP',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8" fallback="OU" />
      <Avatar className="h-10 w-10" fallback="OU" />
      <Avatar className="h-14 w-14" fallback="OU" />
    </div>
  ),
};
