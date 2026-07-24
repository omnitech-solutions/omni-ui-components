import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Input, type InputProps } from '@oc-tech/omni-ui-components/Input';
import { inputPropsFactory } from 'factories/omni-ui-components/Input/Input.factories';

const Renderer: React.FC<InputProps> = (args) => {
  const [value, setValue] = React.useState<string>(typeof args.value === 'string' ? args.value : '');
  React.useEffect(() => {
    setValue(typeof args.value === 'string' ? args.value : '');
  }, [args.value]);
  return (
    <Input
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof Input> = {
  title: 'omni-ui-components/Input',
  component: Input,
  tags: ['autodocs'],
  args: inputPropsFactory({ wrapperClassName: 'mx-auto max-w-md' }),
  argTypes: {
    variant: { control: 'inline-radio', options: ['ghost', 'bordered'] },
    inputSize: { control: 'inline-radio', options: ['sm', 'default', 'md', 'lg'] },
    layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    onChange: { action: 'changed' },
    onBlur: { action: 'blurred' },
    onFocus: { action: 'focused' },
  },
  render: (args) => <Renderer {...(args as InputProps)} />,
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const HorizontalSidebar: Story = {
  args: {
    layout: 'horizontal',
    label: 'Payment Terms',
    placeholder: 'Add payment terms',
    variant: 'ghost',
    wrapperClassName: 'mx-auto max-w-lg',
  },
};

export const Required: Story = { args: { required: true } };

export const WithDescription: Story = {
  args: { description: 'We never share this with anyone.' },
};

export const WithError: Story = {
  args: { error: "Subject can't be blank", value: '' },
};

export const Disabled: Story = { args: { disabled: true, value: 'Read-only value' } };

export const ReadOnly: Story = { args: { readOnly: true, value: 'Read-only value' } };

export const Ghost: Story = { args: { variant: 'ghost', placeholder: 'inline edit…' } };

export const CommitOnEnter: Story = {
  args: { commitOnEnter: true, label: 'Press Enter or Escape to blur' },
};

export const SizesMatrix: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {(['sm', 'default', 'md', 'lg'] as const).map((s) => (
        <Renderer key={s} {...(args as InputProps)} inputSize={s} label={`size=${s}`} />
      ))}
    </div>
  ),
};
