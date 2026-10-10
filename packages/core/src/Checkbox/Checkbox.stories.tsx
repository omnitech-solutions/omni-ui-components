import { Checkbox, type CheckboxProps } from '@oc-tech/omni-ui-components/Checkbox';
import type { Meta, StoryObj } from '@storybook/react';
import { checkboxPropsFactory } from 'factories/omni-ui-components/Checkbox/Checkbox.factories';
import * as React from 'react';

const Renderer: React.FC<CheckboxProps> = (args) => {
  const [checked, setChecked] = React.useState<boolean>(Boolean(args.checked));
  React.useEffect(() => setChecked(Boolean(args.checked)), [args.checked]);
  return (
    <Checkbox
      {...args}
      checked={checked}
      onChange={(next) => {
        setChecked(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof Checkbox> = {
  title: 'omni-ui-components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: checkboxPropsFactory({ wrapperClassName: 'mx-auto max-w-md' }),
  argTypes: {
    layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    onChange: { action: 'changed' },
  },
  render: (args) => <Renderer {...(args as CheckboxProps)} />,
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};

export const Checked: Story = { args: { checked: true } };

export const Required: Story = { args: { required: true } };

export const WithoutDescription: Story = { args: { description: undefined } };

export const WithError: Story = {
  args: { error: 'You must agree to continue', checked: false },
};

export const Disabled: Story = { args: { disabled: true, checked: true } };

/** Read-only: focusable and readable, announced as such, and the value cannot change. */
export const ReadOnly: Story = { args: { readOnly: true, checked: true } };
