import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { RichText, type RichTextProps } from '@oc-tech/omni-ui-components/RichText';

const Renderer: React.FC<RichTextProps> = (args) => {
  const [value, setValue] = React.useState<string>(args.value ?? '');
  React.useEffect(() => setValue(args.value ?? ''), [args.value]);
  return (
    <RichText
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof RichText> = {
  title: 'omni-ui-components/RichText',
  component: RichText,
  tags: ['autodocs'],
  args: { id: 'demo-rich', label: 'Description', value: '', wrapperClassName: 'mx-auto max-w-2xl' },
  argTypes: { onChange: { action: 'changed' } },
  render: (args) => <Renderer {...(args as RichTextProps)} />,
};
export default meta;

type Story = StoryObj<typeof RichText>;
export const Default: Story = {};
export const Prefilled: Story = { args: { value: '<p>Hello <strong>world</strong>. Here is a <em>rich text</em> field.</p>' } };
export const WithError: Story = { args: { error: 'Description is required' } };
export const Disabled: Story = { args: { disabled: true, value: '<p>Locked content</p>' } };
