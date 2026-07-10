import type { SelectProps } from '@omnitech/omni-ui-core/Select/Select.types';
import type { Variant } from '../../internal/support/makeFactory';

import { COUNTRY_OPTIONS } from './countries';

export const SAMPLE_COUNTRIES = COUNTRY_OPTIONS;
export { COUNTRY_OPTIONS } from './countries';

/**
 * Build `<Select>` props for standalone (non-RJSF) stories and tests.
 *
 * @example
 * render(<Select {...selectPropsFactory({ value: 'CA' })} />);
 */
export const selectPropsFactory = (overrides: Partial<SelectProps> = {}): SelectProps => ({
  id: 'demo-select',
  label: 'Country',
  placeholder: 'Select country…',
  options: SAMPLE_COUNTRIES,
  value: '',
  variant: 'bordered',
  selectSize: 'default',
  layout: 'vertical',
  required: false,
  disabled: false,
  ...overrides,
});

/** Ordered variant matrix used by the cheatsheet + kitchen-sink stories. */
export const selectVariants: Variant<SelectProps>[] = [
  { name: 'Default', args: { label: 'Default' } },
  {
    name: 'Grouped options',
    args: {
      label: 'Grouped options',
      placeholder: 'Pick a category…',
      options: [
        { value: 'advertising', label: 'Advertising', group: 'ADS & MARKETING' },
        { value: 'cost_of_labor', label: 'Cost of Labor', group: 'COGS' },
        { value: 'materials', label: 'Materials & Supplies', group: 'COGS' },
        { value: 'misc_fees', label: 'Misc Fees', group: 'COMMISSIONS & FEES' },
      ],
    },
  },
  {
    name: 'Footer action',
    args: {
      label: 'Footer action',
      placeholder: 'Pick a tax rate…',
      options: [
        { value: 'standard_10', label: '10% (Standard Sales Tax)' },
        { value: 'state_5', label: '5% (State Tax)' },
        { value: 'vat_20', label: '20% (VAT)' },
      ],
      footerAction: { label: 'Manage Tax Rates', href: '/settings/tax_rates' },
    },
  },
  {
    name: 'Description + color',
    args: {
      label: 'Description + color',
      placeholder: 'Pick a project…',
      options: [
        { value: 'bugs-w27', label: '🐛 Bugs - Week 27', description: 'Omni Product Development', color: '#e07a5f' },
        { value: 'security', label: '🔒 Security Items', description: 'Omni Product Development', color: '#808080' },
      ],
    },
  },
  { name: 'Required', args: { label: 'Required', required: true, value: '' } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: 'US' } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Please pick a country', required: true, value: '' } },
];
