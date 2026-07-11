import type { Meta, StoryObj } from '@storybook/react';

import { Carousel } from '@omnitech/omni-ui-core/Carousel';

const meta: Meta<typeof Carousel> = {
  title: 'omni-ui-components/Carousel',
  component: Carousel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Lightweight carousel for stepping through a <primary>small set of panels or promotional surfaces</primary>. Best suited to <primary>low-complexity paged content</primary>.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Carousel>;
export const Default: Story = {
  render: () => (
    <Carousel>
      <div className="p-10 text-center">Slide 1</div>
      <div className="p-10 text-center">Slide 2</div>
      <div className="p-10 text-center">Slide 3</div>
    </Carousel>
  ),
};

export const TwoSlides: Story = {
  render: () => (
    <Carousel>
      <div className="p-10 text-center">Overview</div>
      <div className="p-10 text-center">Details</div>
    </Carousel>
  ),
};
