import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { EmailInput, type EmailInputProps } from '@omnitech/omni-ui-core/EmailInput';

const Renderer: React.FC<EmailInputProps> = (args) => {
  const [value, setValue] = React.useState<string>(typeof args.value === 'string' ? args.value : '');
  return <EmailInput {...args} value={value} onChange={(next) => setValue(typeof next === 'string' ? next : value)} />;
};

const meta: Meta<typeof EmailInput> = {
  title: 'omni-ui-components/EmailInput',
  component: EmailInput,
  tags: ['autodocs'],
  args: { id: 'demo-email', label: 'Email', wrapperClassName: 'mx-auto max-w-md' },
  argTypes: { onChange: { action: 'changed' } },
  render: (args) => <Renderer {...(args as EmailInputProps)} />,
};
export default meta;

type Story = StoryObj<typeof EmailInput>;
export const Default: Story = {};
export const Prefilled: Story = { args: { value: 'ada@example.com' } };
export const WithError: Story = { args: { error: 'Enter a valid email' } };
export const Disabled: Story = { args: { disabled: true, value: 'ada@example.com' } };
