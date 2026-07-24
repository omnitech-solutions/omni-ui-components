import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { PhoneInput, type PhoneInputProps } from '@oc-tech/omni-ui-components/PhoneInput';
import { phoneInputPropsFactory } from 'factories/omni-ui-components/PhoneInput/PhoneInput.factories';

const Renderer: React.FC<PhoneInputProps> = (args) => {
  const [value, setValue] = React.useState<string>(args.value ?? '');
  React.useEffect(() => setValue(args.value ?? ''), [args.value]);
  return (
    <PhoneInput
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof PhoneInput> = {
  title: 'omni-ui-components/PhoneInput',
  component: PhoneInput,
  tags: ['autodocs'],
  args: phoneInputPropsFactory({ wrapperClassName: 'mx-auto max-w-md' }),
  argTypes: { onChange: { action: 'changed' } },
  render: (args) => <Renderer {...(args as PhoneInputProps)} />,
};
export default meta;

type Story = StoryObj<typeof PhoneInput>;
export const Default: Story = {};
export const Prefilled: Story = { args: { value: '+1 555 0100' } };
export const WithDefaultDialCode: Story = { args: { defaultDialCode: '+44', placeholder: '7700 900123' } };
export const WithError: Story = { args: { error: 'Enter a 10+ digit phone number', value: '' } };
export const Disabled: Story = { args: { disabled: true, value: '+1 555 0100' } };
