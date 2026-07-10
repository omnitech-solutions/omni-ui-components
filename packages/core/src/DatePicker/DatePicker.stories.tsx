import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { DatePicker, type DatePickerProps, type DateRange } from '@omnitech/omni-ui-core/DatePicker';
import { datePickerPropsFactory } from 'factories/omni-ui-components/DatePicker/DatePicker.factories';

const Renderer: React.FC<DatePickerProps> = (args) => {
  const [value, setValue] = React.useState<Date | DateRange | null>(args.value ?? null);
  React.useEffect(() => setValue(args.value ?? null), [args.value]);
  return (
    <DatePicker
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof DatePicker> = {
  title: 'omni-ui-components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  args: datePickerPropsFactory({ wrapperClassName: 'mx-auto max-w-md' }),
  argTypes: {
    mode: { control: 'inline-radio', options: ['single', 'range'] },
    layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    onChange: { action: 'changed' },
  },
  render: (args) => <Renderer {...(args as DatePickerProps)} />,
};
export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {};
export const Prefilled: Story = { args: { value: new Date(2026, 6, 15) } };
export const RangeMode: Story = { args: { mode: 'range', label: 'Date range', value: { from: new Date(2026, 6, 1), to: new Date(2026, 6, 15) } } };
export const Required: Story = { args: { required: true } };
export const WithError: Story = { args: { error: 'Pick a date in the future', value: null } };
export const Disabled: Story = { args: { disabled: true, value: new Date(2026, 6, 15) } };
