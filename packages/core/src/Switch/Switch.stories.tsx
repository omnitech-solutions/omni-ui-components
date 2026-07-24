import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Switch, type SwitchProps } from '@oc-tech/omni-ui-components/Switch';
import { switchPropsFactory } from 'factories/omni-ui-components/Switch/Switch.factories';

const Renderer: React.FC<SwitchProps> = (args) => {
  const [checked, setChecked] = React.useState<boolean>(Boolean(args.checked));
  React.useEffect(() => setChecked(Boolean(args.checked)), [args.checked]);
  return (
    <Switch
      {...args}
      checked={checked}
      onChange={(c) => {
        setChecked(c);
        args.onChange?.(c);
      }}
    />
  );
};

const meta: Meta<typeof Switch> = {
  title: 'omni-ui-components/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: switchPropsFactory({ wrapperClassName: 'mx-auto max-w-md' }),
  argTypes: {
    switchSide: { control: 'inline-radio', options: ['left', 'right'] },
    onChange: { action: 'changed' },
  },
  render: (args) => <Renderer {...(args as SwitchProps)} />,
};
export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {};
export const Checked: Story = { args: { checked: true } };
export const SwitchOnLeft: Story = { args: { switchSide: 'left' } };
export const WithError: Story = { args: { error: 'You must enable to continue', checked: false } };
export const Disabled: Story = { args: { disabled: true, checked: true } };
