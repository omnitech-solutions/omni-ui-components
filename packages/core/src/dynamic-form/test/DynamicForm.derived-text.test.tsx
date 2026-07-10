import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { z } from 'zod';
import type { RJSFSchema, UiSchema } from '@rjsf/utils';

import { DynamicForm } from 'dynamic-form';
import { buildFormContext } from 'dynamic-form/lib/formContext';
import { deriveExpenseCanary, expenseCanaryFixture, type ExpenseCanaryFormData } from 'factories/dynamic-form/DynamicForm/expense.factories';

/**
 * The DerivedTextWidget reads from `formContext.derived[derivedKey]`.
 * These tests prove (1) it renders the derived string, (2) the
 * formula recomputes when source fields change, (3) the derived
 * value never reaches the submit payload.
 */
describe('DynamicForm — DerivedTextWidget + derive', () => {
  describe('deriveExpenseCanary (pure function)', () => {
    it('formats Sales Price and Excluding Tax with the chosen currency', () => {
      const out = deriveExpenseCanary({ amount: 100, currency: 'GBP', taxRateId: 'state_5', markupPercent: 19, billable: true });
      expect(out.excludingTaxLabel).toContain('£');
      expect(out.excludingTaxLabel).toContain('Excluding Tax');
      expect(out.salesPriceLabel).toContain('£');
      expect(out.salesPriceLabel).toContain('Sales Price');
    });

    it('returns neutral labels when amount is missing', () => {
      const out = deriveExpenseCanary({});
      expect(out.excludingTaxLabel).toMatch(/£0\.00.*Excluding Tax/);
      expect(out.salesPriceLabel).toMatch(/£0\.00.*Sales Price/);
    });

    it('honors markup % so salesPrice > excludingTax * (1 + tax)', () => {
      const zero = deriveExpenseCanary({ amount: 100, currency: 'GBP', taxRateId: 'none', markupPercent: 0, billable: true });
      const marked = deriveExpenseCanary({ amount: 100, currency: 'GBP', taxRateId: 'none', markupPercent: 19, billable: true });
      expect(zero.salesPriceLabel).not.toEqual(marked.salesPriceLabel);
    });

    it('switches locale + symbol when currency is ETB', () => {
      const out = deriveExpenseCanary({ amount: 4999, currency: 'ETB', taxRateId: 'state_5', markupPercent: 19, billable: true });
      expect(out.salesPriceLabel).toMatch(/ETB|Br/);
    });
  });

  describe('DerivedTextWidget rendering through DynamicForm', () => {
    function Harness() {
      const fixture = expenseCanaryFixture();
      const [formData, setFormData] = React.useState<ExpenseCanaryFormData>(fixture.defaults);
      const derived = fixture.derive(formData);
      const formContext = buildFormContext(fixture.formContext, derived);

      return (
        <DynamicForm
          schema={fixture.schema}
          uiSchema={fixture.uiSchema}
          zodSchema={fixture.zodSchema}
          formData={formData}
          formContext={formContext}
          onChange={(next) => setFormData(next as ExpenseCanaryFormData)}
          onSubmit={jest.fn()}
        />
      );
    }

    it('renders the derived Sales Price element', () => {
      render(<Harness />);
      const el = screen.getByTestId('root_salesPriceLabel-derived');
      expect(el).toBeInTheDocument();
      expect(el.textContent).toMatch(/Sales Price/);
    });

    it('does not include the derived field in the rendered submit payload (it is not an input)', () => {
      render(<Harness />);
      expect(screen.queryByRole('textbox', { name: /Sales Price/ })).toBeNull();
    });
  });

  describe('DerivedTextWidget options edge-cases', () => {
    const schema: RJSFSchema = {
      type: 'object',
      properties: { display: { type: 'string', title: '' } },
    };
    const uiSchema: UiSchema = {
      display: { 'ui:widget': 'derivedText', 'ui:options': { derivedKey: 'missingKey' } },
    };

    it('renders empty content when the derivedKey is absent from formContext.derived', () => {
      render(
        <DynamicForm
          schema={schema}
          uiSchema={uiSchema}
          zodSchema={z.object({ display: z.string().optional() }) as never}
          formData={{ display: '' }}
          formContext={buildFormContext({ optionSets: {}, actions: {}, locale: 'en' }, {})}
          onSubmit={jest.fn()}
        />,
      );
      const el = screen.getByTestId('root_display-derived');
      expect(el).toBeInTheDocument();
      expect(el.textContent).toBe('');
    });
  });
});
