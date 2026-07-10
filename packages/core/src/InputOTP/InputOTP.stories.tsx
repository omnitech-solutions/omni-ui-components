import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { InputOTP, type InputOTPProps } from '@omnitech/omni-ui-core/InputOTP';

const Renderer: React.FC<InputOTPProps> = (args) => {
  const [value, setValue] = React.useState<string>(args.value ?? '');
  React.useEffect(() => setValue(args.value ?? ''), [args.value]);
  return (
    <InputOTP
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof InputOTP> = {
  title: 'omni-ui-components/InputOTP',
  component: InputOTP,
  tags: ['autodocs'],
  args: { id: 'demo-otp', label: 'Verification code', length: 6, wrapperClassName: 'mx-auto max-w-md' },
  argTypes: { onChange: { action: 'changed' } },
  render: (args) => <Renderer {...(args as InputOTPProps)} />,
};
export default meta;

type Story = StoryObj<typeof InputOTP>;
export const Default: Story = {};
export const Prefilled: Story = { args: { value: '123456' } };
export const FourDigit: Story = { args: { length: 4, label: 'PIN' } };
export const WithError: Story = { args: { error: 'Code is incorrect' } };
export const Disabled: Story = { args: { disabled: true, value: '123456' } };
