import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Segmented, type SegmentedProps } from '@oc-tech/omni-ui-components/Segmented';
import { segmentedPropsFactory } from 'factories/omni-ui-components/Segmented/Segmented.factories';

const Renderer: React.FC<SegmentedProps> = (args) => {
  const [value, setValue] = React.useState<string>(args.value ?? '');
  React.useEffect(() => setValue(args.value ?? ''), [args.value]);
  return (
    <Segmented
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof Segmented> = {
  title: 'omni-ui-components/Segmented',
  component: Segmented,
  tags: ['autodocs'],
  args: segmentedPropsFactory({ wrapperClassName: 'mx-auto max-w-md' }),
  argTypes: {
    layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    onChange: { action: 'changed' },
  },
  render: (args) => <Renderer {...(args as SegmentedProps)} />,
};
export default meta;

type Story = StoryObj<typeof Segmented>;

export const Default: Story = {};

export const TwoOptions: Story = {
  args: {
    label: 'Auto-publish',
    value: 'yes',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
};

export const Required: Story = { args: { required: true } };

export const WithError: Story = {
  args: { error: 'Tone is required', value: '' },
};

export const Disabled: Story = { args: { disabled: true, value: 'professional' } };

export const HorizontalSidebar: Story = {
  args: { layout: 'horizontal', label: 'Tone', wrapperClassName: 'mx-auto max-w-lg' },
};
