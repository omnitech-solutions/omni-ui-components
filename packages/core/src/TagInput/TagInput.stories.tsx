import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { TagInput, type TagInputProps } from '@omnitech/omni-ui-core/TagInput';

const Renderer: React.FC<TagInputProps> = (args) => {
  const [value, setValue] = React.useState<string[]>(args.value ?? []);
  React.useEffect(() => setValue(args.value ?? []), [args.value]);
  return (
    <TagInput
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof TagInput> = {
  title: 'omni-ui-components/TagInput',
  component: TagInput,
  tags: ['autodocs'],
  args: { id: 'demo-tags', label: 'Tags', placeholder: 'Add a tag…', value: [], wrapperClassName: 'mx-auto max-w-md' },
  argTypes: { onChange: { action: 'changed' } },
  render: (args) => <Renderer {...(args as TagInputProps)} />,
};
export default meta;

type Story = StoryObj<typeof TagInput>;
export const Default: Story = {};
export const Prefilled: Story = { args: { value: ['react', 'typescript', 'tailwind'] } };
export const MaxItems: Story = { args: { maxItems: 3, description: 'Up to 3 tags' } };
export const WithError: Story = { args: { error: 'At least one tag required' } };
export const Disabled: Story = { args: { disabled: true, value: ['locked'] } };
