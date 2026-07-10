import * as React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SelectPrimitive } from '@omnitech/omni-ui-core/Select/SelectPrimitive';
import type { SelectOption } from '@omnitech/omni-ui-core/Select/Select.types';

/* cmdk auto-scrolls the focused option; jsdom has no scrollIntoView. */
beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

const GROUPED: SelectOption[] = [
  { value: 'cost_of_labor', label: 'Cost of Labor', group: 'COGS' },
  { value: 'materials', label: 'Materials & Supplies', group: 'COGS' },
  { value: 'advertising', label: 'Advertising', group: 'ADS & MARKETING' },
  { value: 'misc_fees', label: 'Misc Fees', group: 'COMMISSIONS & FEES' },
];

describe('SelectPrimitive — grouped options + footer action', () => {
  it('renders distinct group headings around grouped options', async () => {
    const user = userEvent.setup();
    render(<SelectPrimitive id="cat" options={GROUPED} value="" onChange={jest.fn()} />);

    await user.click(screen.getByTestId('cat'));

    expect(screen.getByTestId('cat-group-COGS')).toBeInTheDocument();
    expect(screen.getByTestId('cat-group-ADS & MARKETING')).toBeInTheDocument();
    expect(screen.getByTestId('cat-group-COMMISSIONS & FEES')).toBeInTheDocument();
  });

  it('group headings are not selectable options', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<SelectPrimitive id="cat" options={GROUPED} value="" onChange={onChange} />);

    await user.click(screen.getByTestId('cat'));
    // Heading is rendered as a styled cmdk group label, not as a CommandItem,
    // so it has no data-testid for the option pattern.
    expect(screen.queryByTestId('cat-option-COGS')).toBeNull();
  });

  it('renders a footer action and fires onSelect when picked', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();
    render(
      <SelectPrimitive
        id="tax"
        options={[{ value: 'standard_10', label: '10% (Standard Sales Tax)' }]}
        value=""
        onChange={jest.fn()}
        footerAction={{ label: 'Manage Tax Rates', onSelect }}
      />,
    );

    await user.click(screen.getByTestId('tax'));
    await user.click(screen.getByTestId('tax-footer-action'));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('falls back to the un-grouped section for options without a group', async () => {
    const user = userEvent.setup();
    render(
      <SelectPrimitive
        id="flat"
        options={[
          { value: 'gbp', label: 'GBP' },
          { value: 'etb', label: 'ETB' },
        ]}
        value=""
        onChange={jest.fn()}
      />,
    );

    await user.click(screen.getByTestId('flat'));
    expect(screen.getByTestId('flat-option-gbp')).toBeInTheDocument();
    expect(screen.getByTestId('flat-option-etb')).toBeInTheDocument();
  });

  it('renders description + color dot when option supplies them', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SelectPrimitive
        id="proj"
        options={[{ value: 'p1', label: 'Bugs - Week 27', description: 'Omni Product Development', color: '#ff0000' }]}
        value=""
        onChange={jest.fn()}
      />,
    );

    await user.click(screen.getByTestId('proj'));
    const opt = screen.getByTestId('proj-option-p1');
    expect(within(opt).getByText('Omni Product Development')).toBeInTheDocument();
    expect(opt.querySelector('span[style*="background-color"]')).not.toBeNull();
    expect(container).toBeTruthy();
  });
});
