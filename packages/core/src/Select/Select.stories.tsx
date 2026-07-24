import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Select, type SelectProps } from '@oc-tech/omni-ui-components/Select';
import { selectPropsFactory } from 'factories/omni-ui-components/Select/Select.factories';

const Renderer: React.FC<SelectProps> = (args) => {
  const [value, setValue] = React.useState<string>(typeof args.value === 'string' ? args.value : '');
  React.useEffect(() => {
    setValue(typeof args.value === 'string' ? args.value : '');
  }, [args.value]);
  return (
    <Select
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof Select> = {
  title: 'omni-ui-components/Select',
  component: Select,
  tags: ['autodocs'],
  args: selectPropsFactory({ wrapperClassName: 'mx-auto max-w-md' }),
  argTypes: {
    variant: { control: 'inline-radio', options: ['ghost', 'bordered'] },
    selectSize: { control: 'inline-radio', options: ['sm', 'default', 'md', 'lg'] },
    layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    onChange: { action: 'changed' },
    onBlur: { action: 'blurred' },
    onFocus: { action: 'focused' },
  },
  render: (args) => <Renderer {...(args as SelectProps)} />,
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {};

export const Prefilled: Story = { args: { value: 'CA' } };

export const Required: Story = { args: { required: true } };

export const WithDescription: Story = {
  args: { description: 'Pick the country where your team is based.' },
};

export const WithError: Story = {
  args: { error: 'Country is required', value: '' },
};

export const HorizontalSidebar: Story = {
  args: {
    layout: 'horizontal',
    label: 'Country',
    variant: 'ghost',
    wrapperClassName: 'mx-auto max-w-lg',
  },
};

export const Disabled: Story = { args: { disabled: true, value: 'US' } };

export const Ghost: Story = { args: { variant: 'ghost' } };

export const Grouped: Story = {
  args: {
    label: 'Category',
    placeholder: 'Select…',
    options: [
      { value: 'advertising', label: 'Advertising', group: 'ADS & MARKETING' },
      { value: 'cost_of_labor', label: 'Cost of Labor', group: 'COGS' },
      { value: 'materials', label: 'Materials & Supplies', group: 'COGS' },
      { value: 'misc_cogs', label: 'Misc COGS', group: 'COGS' },
      { value: 'misc_fees', label: 'Misc Fees', group: 'COMMISSIONS & FEES' },
    ],
  },
};

export const WithFooterAction: Story = {
  args: {
    label: 'Tax',
    placeholder: 'Select…',
    options: [
      { value: 'standard_10', label: '10% (Standard Sales Tax)' },
      { value: 'state_5', label: '5% (State Tax)' },
      { value: 'vat_20', label: '20% (VAT)' },
    ],
    footerAction: { label: 'Manage Tax Rates', href: '/settings/tax_rates' },
  },
};

export const WithDescriptionAndColor: Story = {
  args: {
    label: 'Project',
    placeholder: 'Select project…',
    options: [
      { value: 'bugs-w27', label: '🐛 Bugs - Week 27', description: 'Omni Product Development', color: '#e07a5f' },
      { value: 'security', label: '🔒 Security Items', description: 'Omni Product Development', color: '#808080' },
    ],
  },
};

export const SizesMatrix: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {(['sm', 'default', 'md', 'lg'] as const).map((s) => (
        <Renderer key={s} {...(args as SelectProps)} selectSize={s} label={`size=${s}`} />
      ))}
    </div>
  ),
};
