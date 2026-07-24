import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { CheckboxGroup, type CheckboxGroupProps } from '@oc-tech/omni-ui-components/Checkbox';
import { checkboxGroupPropsFactory } from 'factories/omni-ui-components/Checkbox/Checkbox.factories';

const Renderer: React.FC<CheckboxGroupProps> = (args) => {
  const [value, setValue] = React.useState<string[]>(args.value ?? []);
  React.useEffect(() => setValue(args.value ?? []), [args.value]);
  return (
    <CheckboxGroup
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof CheckboxGroup> = {
  title: 'omni-ui-components/CheckboxGroup',
  component: CheckboxGroup,
  tags: ['autodocs'],
  args: checkboxGroupPropsFactory({ wrapperClassName: 'mx-auto max-w-md' }),
  argTypes: {
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    onChange: { action: 'changed' },
  },
  render: (args) => <Renderer {...(args as CheckboxGroupProps)} />,
};
export default meta;

type Story = StoryObj<typeof CheckboxGroup>;

export const Default: Story = {};

export const Prefilled: Story = { args: { value: ['email', 'push'] } };

export const Required: Story = { args: { required: true } };

export const Inline: Story = { args: { orientation: 'horizontal' } };

export const WithDescription: Story = { args: { description: 'Used by reminders and onboarding.' } };

export const WithError: Story = {
  args: { error: 'Pick at least one channel', value: [] },
};

export const Disabled: Story = { args: { disabled: true, value: ['email'] } };
