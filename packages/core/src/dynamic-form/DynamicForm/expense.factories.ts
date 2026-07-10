import { z } from 'zod';

import type { DynamicFormFixture } from './DynamicForm.factories';
import { deriveExpense, type ExpenseCurrency, type ExpenseDerived, type ExpenseTaxRateId } from '../../Form/expenseScenario.factories';

/**
 * Expense canary fixture — the smallest schema that exercises the
 * derived-display contract end to end. Pinned to the legacy canary
 * field names (markupPercent, taxRateId) so the original PR 2 tests
 * keep their expectations; the derive function maps to the canonical
 * `deriveExpense` in the Form fixture.
 */
export type { ExpenseCurrency, ExpenseTaxRateId };
export type ExpenseCanaryDerived = ExpenseDerived;

export interface ExpenseCanaryFormData {
  amount: number;
  currency: ExpenseCurrency;
  taxRateId: ExpenseTaxRateId;
  markupPercent: number;
  billable: boolean;
}

export const deriveExpenseCanary = (formData: Readonly<Partial<ExpenseCanaryFormData>>): ExpenseCanaryDerived =>
  deriveExpense({
    amount: formData.amount,
    currency: formData.currency,
    taxRateId: formData.taxRateId,
    markupPercentage: formData.markupPercent,
  });

export const expenseCanaryZod = z.object({
  amount: z.number().nonnegative('Amount must be at least 0'),
  currency: z.enum(['GBP', 'ETB']),
  taxRateId: z.enum(['none', 'state_5', 'vat_20', 'standard_10']),
  markupPercent: z.number().min(0).max(1000),
  billable: z.boolean(),
}) as unknown as z.ZodType<ExpenseCanaryFormData>;

export const expenseCanaryFixture = (): DynamicFormFixture<ExpenseCanaryFormData, ExpenseCanaryDerived> => ({
  schema: {
    type: 'object',
    required: ['amount', 'currency', 'markupPercent', 'billable'],
    properties: {
      amount: { type: 'number', title: 'Amount' },
      currency: { type: 'string', title: 'Currency', enum: ['GBP', 'ETB'] },
      taxRateId: {
        type: 'string',
        title: 'Tax',
        oneOf: [
          { const: 'none', title: 'No tax' },
          { const: 'standard_10', title: '10% (Standard Sales Tax)' },
          { const: 'state_5', title: '5% (State Tax)' },
          { const: 'vat_20', title: '20% (VAT)' },
        ],
      },
      markupPercent: { type: 'number', title: 'Markup %' },
      billable: { type: 'boolean', title: 'Billable' },
      excludingTaxLabel: { type: 'string', title: '' },
      salesPriceLabel: { type: 'string', title: '' },
    },
  },
  uiSchema: {
    'ui:rows': [['amount', 'currency'], ['markupPercent', 'taxRateId'], ['billable'], ['excludingTaxLabel'], ['salesPriceLabel']],
    amount: { 'ui:widget': 'currency' },
    currency: { 'ui:widget': 'select' },
    taxRateId: { 'ui:widget': 'select' },
    markupPercent: { 'ui:widget': 'numberInput', 'ui:options': { suffix: '%' } },
    billable: { 'ui:widget': 'switch' },
    excludingTaxLabel: { 'ui:widget': 'derivedText', 'ui:options': { derivedKey: 'excludingTaxLabel', tone: 'muted' } },
    salesPriceLabel: { 'ui:widget': 'derivedText', 'ui:options': { derivedKey: 'salesPriceLabel', tone: 'default' } },
  },
  zodSchema: expenseCanaryZod,
  defaults: { amount: 0, currency: 'GBP', taxRateId: 'none', markupPercent: 0, billable: false },
  derive: deriveExpenseCanary,
  formContext: { optionSets: {}, actions: {}, locale: 'en-GB' },
});
