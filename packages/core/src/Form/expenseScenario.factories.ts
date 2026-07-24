import { z } from 'zod';

import type { FormFixture } from '@oc-tech/omni-ui-components/Form/Form.types';
import { SHOWCASE_EXPENSE_CATEGORIES, SHOWCASE_MEMBERS, SHOWCASE_PROJECTS, SHOWCASE_TAX_RATES } from '../../showcase/entities';
import { formOptions, project } from '../../helpers/optionMappers';

/**
 * New Expense scenario — canonical source for both Form and RJSF.
 *
 * Mirrors POST /api/v1/expenses expense_params:
 *   { amount, name, notes, expense_date, billable, recurring,
 *     recurring_time, recurring_time_unit, currency,
 *     deductible_status, deductible_percentage,
 *     deduction_questionable, company_tag_id,
 *     expense_receipt_blob_id, member_id, markup_percentage,
 *     tax_rate_ids: [] }
 *   plus invoice_id and project_id resolved by the controller.
 *
 * Visible fields match the modal screenshots. Hidden fields are
 * carried in `initial` + Zod + the RJSF schema so submit payloads
 * round-trip to the backend without modification.
 */
export type ExpenseTaxRateId = 'none' | 'state_5' | 'vat_20' | 'standard_10';
export type ExpenseCurrency = 'GBP' | 'ETB';

export interface ExpenseScenarioFormData {
  /* Visible */
  name: string;
  companyTagId: string; // Category
  amount: number;
  currency: ExpenseCurrency;
  /** UI binds a single tax rate; backend accepts an array. Form submit
   *  passes this as the single id; the API mapper wraps as `tax_rate_ids: [taxRateId]`. */
  taxRateId: string;
  markupPercentage: number;
  billable: boolean;
  expenseDate: string;
  recurring: boolean;
  expenseReceiptBlobId: string;
  projectId: string;
  memberId: string;
  notes: string;
  /* Hidden API parity */
  deductibleStatus: string;
  deductiblePercentage: number;
  deductionQuestionable: boolean;
  recurringTime: number;
  recurringTimeUnit: string;
  invoiceId: string;
}

export const expenseScenarioInitial: ExpenseScenarioFormData = {
  name: '',
  companyTagId: '',
  amount: 200,
  currency: 'GBP',
  taxRateId: 'none',
  markupPercentage: 0,
  billable: false,
  expenseDate: '2026-06-29',
  recurring: false,
  expenseReceiptBlobId: '',
  projectId: '',
  memberId: '',
  notes: '',
  deductibleStatus: 'unknown',
  deductiblePercentage: 100,
  deductionQuestionable: false,
  recurringTime: 1,
  recurringTimeUnit: 'month',
  invoiceId: '',
};

export const expenseScenarioZod = z.object({
  name: z.string().min(1, 'Name is required'),
  companyTagId: z.string().optional().default(''),
  amount: z.number().nonnegative('Amount must be 0 or greater'),
  currency: z.enum(['GBP', 'ETB']),
  taxRateId: z.string().optional().default('none'),
  markupPercentage: z.number().min(0).max(1000),
  billable: z.boolean(),
  expenseDate: z.string().min(1, 'Date is required'),
  recurring: z.boolean(),
  expenseReceiptBlobId: z.string().optional().default(''),
  projectId: z.string().optional().default(''),
  memberId: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  deductibleStatus: z.string().optional().default('unknown'),
  deductiblePercentage: z.number().optional().default(100),
  deductionQuestionable: z.boolean().optional().default(false),
  recurringTime: z.number().optional().default(1),
  recurringTimeUnit: z.string().optional().default('month'),
  invoiceId: z.string().optional().default(''),
}) as unknown as z.ZodType<ExpenseScenarioFormData>;

/* -------------------------------------------------------------------------- */
/* Derived display helpers                                                      */
/* -------------------------------------------------------------------------- */

const TAX_RATE_BY_ID: Record<string, number> = Object.fromEntries(SHOWCASE_TAX_RATES.map((t) => [t.id, t.percent]));

export const formatExpenseAmount = (n: number, currency: ExpenseCurrency): string => {
  const locale = currency === 'ETB' ? 'en-ET' : 'en-GB';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number.isFinite(n) ? n : 0);
};

export interface ExpenseDerived {
  excludingTaxLabel: string;
  salesPriceLabel: string;
  [key: string]: string;
}

export const deriveExpense = (data: Readonly<Partial<ExpenseScenarioFormData>>): ExpenseDerived => {
  const amount = typeof data.amount === 'number' && Number.isFinite(data.amount) ? data.amount : 0;
  const markup = typeof data.markupPercentage === 'number' && Number.isFinite(data.markupPercentage) ? data.markupPercentage / 100 : 0;
  const currency: ExpenseCurrency = data.currency === 'ETB' ? 'ETB' : 'GBP';
  const taxRateId = typeof data.taxRateId === 'string' && data.taxRateId.length > 0 ? data.taxRateId : 'none';
  const taxRate = TAX_RATE_BY_ID[taxRateId] ?? 0;
  const excludingTax = amount / (1 + taxRate);
  const salesPrice = amount * (1 + markup);
  return {
    excludingTaxLabel: `${formatExpenseAmount(excludingTax, currency)} Excluding Tax`,
    salesPriceLabel: `${formatExpenseAmount(salesPrice, currency)} Sales Price`,
  };
};

/* -------------------------------------------------------------------------- */
/* Option list adapters                                                         */
/* -------------------------------------------------------------------------- */

export const expenseCategoryOptions = () => project(SHOWCASE_EXPENSE_CATEGORIES, { value: 'id' as const, label: 'label' as const });
export const expenseTaxRateOptions = () => project(SHOWCASE_TAX_RATES, { value: 'id' as const, label: 'label' as const });
export const expenseProjectOptions = () => project(SHOWCASE_PROJECTS, { value: 'id' as const, label: (p) => `${p.icon} ${p.name}` });
export const expenseMemberOptions = () => formOptions(SHOWCASE_MEMBERS);

export const expenseScenarioFormFactory = (overrides: Partial<ExpenseScenarioFormData> = {}): FormFixture<ExpenseScenarioFormData> => {
  const initial = { ...expenseScenarioInitial, ...overrides };
  const derived = deriveExpense(initial);

  return {
    title: 'New Expense',
    maxWidth: 'max-w-3xl',
    schema: expenseScenarioZod,
    initial,
    rows: [
      [
        { name: 'name', label: 'Name', placeholder: 'Travel expenses', required: true },
        { name: 'companyTagId', label: 'Category', type: 'select', placeholder: 'Select…', options: expenseCategoryOptions() },
      ],
      [
        { name: 'amount', label: 'Amount', type: 'currency', required: true },
        /* Tax UI binds a single id; backend wraps as tax_rate_ids: [taxRateId]. */
        { name: 'taxRateId', label: 'Tax', type: 'select', options: expenseTaxRateOptions() },
      ],
      [
        { name: 'billable', label: 'Billable', type: 'checkbox' },
        { name: 'markupPercentage', label: 'Markup', type: 'number' },
      ],
      [
        { name: 'expenseDate', label: 'Date', type: 'date', required: true },
        { name: 'recurring', label: 'Recurring', type: 'checkbox' },
      ],
      { kind: 'heading', title: derived.salesPriceLabel, description: derived.excludingTaxLabel },
      { kind: 'heading', title: 'Additional Fields' },
      [
        { name: 'projectId', label: 'Project', type: 'select', placeholder: 'Select…', options: expenseProjectOptions() },
        { name: 'memberId', label: 'Member', type: 'select', placeholder: 'Select…', options: expenseMemberOptions() },
      ],
      [{ name: 'notes', label: 'Note', type: 'textarea', placeholder: 'Add a note…' }],
      /* expense_receipt_blob_id, deductible_*, recurring_time*,
       * invoice_id are accepted by the API but not rendered as
       * Form rows. Their values flow through `initial` + Zod. */
    ],
  };
};
