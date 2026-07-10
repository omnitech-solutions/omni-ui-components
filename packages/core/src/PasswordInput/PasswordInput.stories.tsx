import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { PasswordInput, type PasswordInputProps } from '@omnitech/omni-ui-core/PasswordInput';

const Renderer: React.FC<PasswordInputProps> = (args) => {
  const [value, setValue] = React.useState<string>(typeof args.value === 'string' ? args.value : '');
  return <PasswordInput {...args} value={value} onChange={(next) => setValue(typeof next === 'string' ? next : value)} />;
};

const meta: Meta<typeof PasswordInput> = {
  title: 'omni-ui-components/PasswordInput',
  component: PasswordInput,
  tags: ['autodocs'],
  args: { id: 'demo-pw', label: 'Password', placeholder: '8+ chars, 1 uppercase, 1 number', wrapperClassName: 'mx-auto max-w-md', toggleable: true },
  argTypes: { onChange: { action: 'changed' } },
  render: (args) => <Renderer {...(args as PasswordInputProps)} />,
};
export default meta;

type Story = StoryObj<typeof PasswordInput>;
export const Default: Story = {};
export const NoToggle: Story = { args: { toggleable: false } };
export const Prefilled: Story = { args: { value: 'hunter2!Pass' } };
export const WithError: Story = { args: { error: 'Password must contain an uppercase letter' } };
export const Disabled: Story = { args: { disabled: true, value: 'hunter2!Pass' } };
