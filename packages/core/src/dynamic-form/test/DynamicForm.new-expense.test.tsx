import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DynamicForm } from 'dynamic-form';
import { buildFormContext } from 'dynamic-form/lib/formContext';
import { expenseScenarioFixture, type ExpenseScenarioFormData } from 'factories/dynamic-form/DynamicForm/expenseScenario.factories';

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

function Harness({ onSubmit, initial }: { onSubmit?: (data: ExpenseScenarioFormData) => void; initial?: Partial<ExpenseScenarioFormData> }) {
  const fixture = expenseScenarioFixture();
  const start = { ...fixture.defaults, ...(initial ?? {}) } as ExpenseScenarioFormData;
  const [formData, setFormData] = React.useState<ExpenseScenarioFormData>(start);
  return (
    <DynamicForm
      schema={fixture.schema}
      uiSchema={fixture.uiSchema}
      zodSchema={fixture.zodSchema}
      formData={formData}
      formContext={buildFormContext(fixture.formContext, fixture.derive(formData))}
      onChange={(next) => setFormData(next as ExpenseScenarioFormData)}
      onSubmit={onSubmit ?? jest.fn()}
    >
      <button type="submit" data-testid="submit-btn">
        Create Expense
      </button>
    </DynamicForm>
  );
}

describe('NewExpense scenario', () => {
  it('renders the canary set of inputs', () => {
    render(<Harness />);
    expect(screen.getByLabelText(/^Name/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Category$/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Tax$/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Markup$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Date/)).toBeInTheDocument();
  });

  it('hides API parity fields (deductibleStatus, invoiceId, etc.)', () => {
    render(<Harness />);
    expect(screen.queryByLabelText(/Deductible Status/)).toBeNull();
    expect(screen.queryByLabelText(/Deductible %/)).toBeNull();
    expect(screen.queryByLabelText(/Recurring Time/)).toBeNull();
    expect(screen.queryByLabelText(/Invoice Id/)).toBeNull();
  });

  it('renders Excluding Tax and Sales Price as derived text (no submit field)', () => {
    render(<Harness initial={{ amount: 100, currency: 'GBP', taxRateId: 'state_5', markupPercentage: 19 }} />);
    expect(screen.getByTestId('root_excludingTaxLabel-derived').textContent).toMatch(/Excluding Tax/);
    expect(screen.getByTestId('root_salesPriceLabel-derived').textContent).toMatch(/Sales Price/);
  });

  it('renders grouped Category options with section headings', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: /^Category$/ }));
    expect(screen.getByTestId('root_companyTagId-group-COGS')).toBeInTheDocument();
    expect(screen.getByTestId('root_companyTagId-group-ADS & MARKETING')).toBeInTheDocument();
  });

  it('renders the "Manage Tax Rates" footer action inside the Tax dropdown', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: /^Tax$/ }));
    expect(screen.getByTestId('root_taxRateId-footer-action')).toHaveTextContent('Manage Tax Rates');
  });

  it('renders Additional Fields collapsed by default', () => {
    render(<Harness />);
    const toggle = screen.getByTestId('oui-collapsible-toggle');
    expect(toggle).toHaveTextContent('Additional Fields');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('reveals Additional Fields children when the toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByTestId('oui-collapsible-toggle'));
    expect(screen.getByRole('button', { name: /^Project$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Member$/ })).toBeInTheDocument();
  });

  it('does NOT include the derived sales price in the submit payload', async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(
      <Harness
        onSubmit={onSubmit}
        initial={{ name: 'Travel', amount: 100, currency: 'GBP', taxRateId: 'state_5', markupPercentage: 19, expenseDate: '2026-06-29' }}
      />,
    );
    await user.click(screen.getByTestId('submit-btn'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload).not.toHaveProperty('salesPriceLabel');
    expect(payload).not.toHaveProperty('excludingTaxLabel');
    expect(payload.amount).toBe(100);
    expect(payload.markupPercentage).toBe(19);
    /* Hidden API parity carries through */
    expect(payload.deductibleStatus).toBe('unknown');
    expect(payload.deductiblePercentage).toBe(100);
  });
});
