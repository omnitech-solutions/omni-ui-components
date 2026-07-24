import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Slider, type SliderProps } from '@oc-tech/omni-ui-components/Slider';
import { sliderPropsFactory } from 'factories/omni-ui-components/Slider/Slider.factories';

const Renderer: React.FC<SliderProps> = (args) => {
  const [value, setValue] = React.useState<number | number[]>(args.value ?? 0);
  React.useEffect(() => setValue(args.value ?? 0), [args.value]);
  return (
    <Slider
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof Slider> = {
  title: 'omni-ui-components/Slider',
  component: Slider,
  tags: ['autodocs'],
  args: sliderPropsFactory({ wrapperClassName: 'mx-auto max-w-md' }),
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    showValue: { control: 'boolean' },
    onChange: { action: 'changed' },
  },
  render: (args) => <Renderer {...(args as SliderProps)} />,
};
export default meta;

type Story = StoryObj<typeof Slider>;

export const Default: Story = {};

export const Prefilled: Story = { args: { value: 80 } };

export const Required: Story = { args: { required: true } };

export const Range: Story = {
  args: { value: [20, 80], label: 'Price range', valueSuffix: '' },
};

export const WithError: Story = {
  args: { error: 'Pick a value above 50', value: 35 },
};

export const FineStep: Story = {
  args: { step: 5, label: 'Padding', valueSuffix: 'px', value: 16 },
};

export const Disabled: Story = { args: { disabled: true, value: 50 } };

export const HorizontalSidebar: Story = {
  args: { layout: 'horizontal', label: 'Volume', wrapperClassName: 'mx-auto max-w-lg' },
};
