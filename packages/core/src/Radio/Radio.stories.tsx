import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Radio, type RadioProps } from '@oc-tech/omni-ui-components/Radio';
import { radioPropsFactory } from 'factories/omni-ui-components/Radio/Radio.factories';

const Renderer: React.FC<RadioProps> = (args) => {
  const [value, setValue] = React.useState<string>(typeof args.value === 'string' ? args.value : '');
  React.useEffect(() => {
    setValue(typeof args.value === 'string' ? args.value : '');
  }, [args.value]);
  return (
    <Radio
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof Radio> = {
  title: 'omni-ui-components/Radio',
  component: Radio,
  tags: ['autodocs'],
  args: radioPropsFactory({ wrapperClassName: 'mx-auto max-w-md' }),
  argTypes: {
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    onChange: { action: 'changed' },
    onBlur: { action: 'blurred' },
    onFocus: { action: 'focused' },
  },
  render: (args) => <Renderer {...(args as RadioProps)} />,
};
export default meta;

type Story = StoryObj<typeof Radio>;

export const Default: Story = {};

export const Prefilled: Story = { args: { value: 'pro' } };

export const Required: Story = { args: { required: true } };

export const Inline: Story = { args: { orientation: 'horizontal' } };

export const WithDescription: Story = {
  args: { description: 'You can switch any time — prorated automatically.' },
};

export const WithError: Story = {
  args: { error: 'Pick a plan to continue', value: '' },
};

export const HorizontalSidebar: Story = {
  args: {
    layout: 'horizontal',
    label: 'Billing plan',
    wrapperClassName: 'mx-auto max-w-lg',
  },
};

export const Disabled: Story = { args: { disabled: true, value: 'pro' } };

export const DisabledOption: Story = {
  args: {
    options: [
      { value: 'free', label: 'Free', description: 'Up to 3 projects.' },
      { value: 'pro', label: 'Pro', description: '$15 / month.' },
      { value: 'team', label: 'Team — coming soon', disabled: true },
    ],
  },
};
