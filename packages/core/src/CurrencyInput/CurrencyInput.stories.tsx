import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { CurrencyInput, type CurrencyInputProps } from '@omnitech/omni-ui-core/CurrencyInput';
import { currencyInputPropsFactory } from 'factories/omni-ui-components/CurrencyInput/CurrencyInput.factories';

const Renderer: React.FC<CurrencyInputProps> = (args) => {
  const [value, setValue] = React.useState<number | null>(args.value ?? null);
  React.useEffect(() => setValue(args.value ?? null), [args.value]);
  return (
    <CurrencyInput
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof CurrencyInput> = {
  title: 'omni-ui-components/CurrencyInput',
  component: CurrencyInput,
  tags: ['autodocs'],
  args: currencyInputPropsFactory({ wrapperClassName: 'mx-auto max-w-md' }),
  argTypes: { onChange: { action: 'changed' } },
  render: (args) => <Renderer {...(args as CurrencyInputProps)} />,
};
export default meta;

type Story = StoryObj<typeof CurrencyInput>;
export const USD: Story = {};
export const EUR: Story = { args: { currency: 'EUR', locale: 'de-DE', value: 1234.5 } };
export const GBP: Story = { args: { currency: 'GBP', locale: 'en-GB', value: 99.99 } };
export const JPY: Story = { args: { currency: 'JPY', locale: 'ja-JP', value: 9999, decimals: 0 } };
export const Required: Story = { args: { required: true, value: null } };
export const Disabled: Story = { args: { disabled: true } };
