import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { NumberInput, type NumberInputProps } from '@omnitech/omni-ui-core/NumberInput';
import { numberInputPropsFactory } from 'factories/omni-ui-components/NumberInput/NumberInput.factories';

const Renderer: React.FC<NumberInputProps> = (args) => {
  const [value, setValue] = React.useState<number | null>(args.value ?? null);
  React.useEffect(() => setValue(args.value ?? null), [args.value]);
  return (
    <NumberInput
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof NumberInput> = {
  title: 'omni-ui-components/NumberInput',
  component: NumberInput,
  tags: ['autodocs'],
  args: numberInputPropsFactory({ wrapperClassName: 'mx-auto max-w-md' }),
  argTypes: { onChange: { action: 'changed' } },
  render: (args) => <Renderer {...(args as NumberInputProps)} />,
};
export default meta;

type Story = StoryObj<typeof NumberInput>;
export const Default: Story = {};
export const Decimals: Story = { args: { value: 12.5, decimals: 2 } };
export const WithSuffix: Story = { args: { label: 'Discount', value: 10, suffix: '%', thousandSeparator: false } };
export const Range: Story = { args: { label: 'Score', value: 75, min: 0, max: 100, suffix: '/100', thousandSeparator: false } };
export const WithError: Story = { args: { error: 'Must be a positive number' } };
export const Disabled: Story = { args: { disabled: true } };
