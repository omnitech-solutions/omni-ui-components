import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Textarea, type TextareaProps } from '@omnitech/omni-ui-core/Textarea';
import { textareaPropsFactory } from 'factories/omni-ui-components/Textarea/Textarea.factories';

const Renderer: React.FC<TextareaProps> = (args) => {
  const [value, setValue] = React.useState<string>(typeof args.value === 'string' ? args.value : '');
  React.useEffect(() => {
    setValue(typeof args.value === 'string' ? args.value : '');
  }, [args.value]);
  return (
    <Textarea
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof Textarea> = {
  title: 'omni-ui-components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: textareaPropsFactory({ wrapperClassName: 'mx-auto max-w-md' }),
  argTypes: {
    variant: { control: 'inline-radio', options: ['ghost', 'bordered'] },
    textareaSize: { control: 'inline-radio', options: ['sm', 'default', 'md', 'lg'] },
    layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    rows: { control: { type: 'number', min: 1, max: 20 } },
    onChange: { action: 'changed' },
    onBlur: { action: 'blurred' },
    onFocus: { action: 'focused' },
  },
  render: (args) => <Renderer {...(args as TextareaProps)} />,
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};

export const HorizontalSidebar: Story = {
  args: {
    layout: 'horizontal',
    label: 'Notes',
    placeholder: 'Anything else?',
    variant: 'ghost',
    rows: 4,
    wrapperClassName: 'mx-auto max-w-lg',
  },
};

export const Required: Story = { args: { required: true } };

export const WithDescription: Story = {
  args: { description: 'Plain text only — no markdown.' },
};

export const WithError: Story = {
  args: { error: "Message can't be blank", value: '' },
};

export const Disabled: Story = { args: { disabled: true, value: 'Read-only value' } };

export const ReadOnly: Story = { args: { readOnly: true, value: 'Read-only value' } };

export const Ghost: Story = { args: { variant: 'ghost', placeholder: 'inline edit…' } };

export const Tall: Story = { args: { rows: 10, label: 'Long-form message' } };

export const SizesMatrix: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {(['sm', 'default', 'md', 'lg'] as const).map((s) => (
        <Renderer key={s} {...(args as TextareaProps)} textareaSize={s} label={`size=${s}`} />
      ))}
    </div>
  ),
};
