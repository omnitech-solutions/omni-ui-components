import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { TimePicker, type TimePickerProps } from '@oc-tech/omni-ui-components/TimePicker';

const Renderer: React.FC<TimePickerProps> = (args) => {
  const [value, setValue] = React.useState<string>(args.value ?? '');
  React.useEffect(() => setValue(args.value ?? ''), [args.value]);
  return (
    <TimePicker
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof TimePicker> = {
  title: 'omni-ui-components/TimePicker',
  component: TimePicker,
  tags: ['autodocs'],
  args: { id: 'demo-time', label: 'Start time', value: '', wrapperClassName: 'mx-auto max-w-md' },
  argTypes: { onChange: { action: 'changed' } },
  render: (args) => <Renderer {...(args as TimePickerProps)} />,
};
export default meta;

type Story = StoryObj<typeof TimePicker>;
export const Default: Story = {};
export const Prefilled: Story = { args: { value: '09:30' } };
export const Seconds: Story = { args: { step: 1, value: '09:30:45' } };
export const WithError: Story = { args: { error: 'Pick a time after 9am' } };
export const Disabled: Story = { args: { disabled: true, value: '09:00' } };
