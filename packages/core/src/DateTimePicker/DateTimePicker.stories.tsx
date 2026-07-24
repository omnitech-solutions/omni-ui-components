import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { DateTimePicker, type DateTimePickerProps } from '@oc-tech/omni-ui-components/DateTimePicker';

const Renderer: React.FC<DateTimePickerProps> = (args) => {
  const [value, setValue] = React.useState<string>(args.value ?? '');
  React.useEffect(() => setValue(args.value ?? ''), [args.value]);
  return (
    <DateTimePicker
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof DateTimePicker> = {
  title: 'omni-ui-components/DateTimePicker',
  component: DateTimePicker,
  tags: ['autodocs'],
  args: { id: 'demo-dt', label: 'Starts at', value: '', wrapperClassName: 'mx-auto max-w-md' },
  argTypes: { onChange: { action: 'changed' } },
  render: (args) => <Renderer {...(args as DateTimePickerProps)} />,
};
export default meta;

type Story = StoryObj<typeof DateTimePicker>;
export const Default: Story = {};
export const Prefilled: Story = { args: { value: '2026-07-15T09:30' } };
export const Required: Story = { args: { required: true } };
export const WithError: Story = { args: { error: 'Pick a future date + time' } };
export const Disabled: Story = { args: { disabled: true, value: '2026-07-15T09:30' } };
