import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { MultiSelect, type MultiSelectProps } from '@oc-tech/omni-ui-components/MultiSelect';

const OPTIONS = [
  { value: 'react', label: 'React' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'tailwind', label: 'Tailwind' },
  { value: 'next', label: 'Next.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
];

const Renderer: React.FC<MultiSelectProps> = (args) => {
  const [value, setValue] = React.useState<string[]>(args.value ?? []);
  React.useEffect(() => setValue(args.value ?? []), [args.value]);
  return (
    <MultiSelect
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof MultiSelect> = {
  title: 'omni-ui-components/MultiSelect',
  component: MultiSelect,
  tags: ['autodocs'],
  args: { id: 'demo-multi', label: 'Stack', options: OPTIONS, value: [], placeholder: 'Pick a few…', wrapperClassName: 'mx-auto max-w-md' },
  argTypes: { onChange: { action: 'changed' } },
  render: (args) => <Renderer {...(args as MultiSelectProps)} />,
};
export default meta;

type Story = StoryObj<typeof MultiSelect>;
export const Default: Story = {};
export const Prefilled: Story = { args: { value: ['react', 'typescript'] } };
export const Searchable: Story = { args: { searchable: true } };
export const MaxItems: Story = { args: { maxItems: 3 } };
export const WithError: Story = { args: { error: 'Pick at least one' } };
export const Disabled: Story = { args: { disabled: true, value: ['react'] } };
