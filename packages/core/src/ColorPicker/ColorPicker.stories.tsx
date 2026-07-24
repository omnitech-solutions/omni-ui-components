import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { ColorPicker, type ColorPickerProps } from '@oc-tech/omni-ui-components/ColorPicker';

const Renderer: React.FC<ColorPickerProps> = (args) => {
  const [value, setValue] = React.useState<string>(args.value ?? '#3b82f6');
  React.useEffect(() => setValue(args.value ?? '#3b82f6'), [args.value]);
  return (
    <ColorPicker
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof ColorPicker> = {
  title: 'omni-ui-components/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
  args: { id: 'demo-color', label: 'Brand color', value: '#22c55e', wrapperClassName: 'mx-auto max-w-md' },
  argTypes: { onChange: { action: 'changed' } },
  render: (args) => <Renderer {...(args as ColorPickerProps)} />,
};
export default meta;

type Story = StoryObj<typeof ColorPicker>;
export const Default: Story = {};
export const Red: Story = { args: { value: '#ef4444' } };
export const WithError: Story = { args: { error: 'Pick a brand color' } };
export const Disabled: Story = { args: { disabled: true } };
