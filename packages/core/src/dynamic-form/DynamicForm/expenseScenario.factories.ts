import { z } from 'zod';

import type { DynamicFormFixture } from './DynamicForm.factories';
import { SHOWCASE_EXPENSE_CATEGORIES, SHOWCASE_MEMBERS, SHOWCASE_PROJECTS, SHOWCASE_TAX_RATES } from '../../../showcase/entities';
import { selectOptions } from '../../../helpers/optionMappers';
import {
  deriveExpense,
  expenseScenarioInitial,
  type ExpenseCurrency,
  type ExpenseDerived,
  type ExpenseScenarioFormData as FlatExpenseFormData,
  type ExpenseTaxRateId,
} from '../../Form/expenseScenario.factories';

export type ExpenseCanaryDerived = ExpenseDerived;
export type { ExpenseTaxRateId, ExpenseCurrency };

/**
 * RJSF nests project/member/notes under `additionalFields` to
 * demonstrate the collapsible ObjectFieldTemplate; the canonical
 * Form fixture keeps them flat. We translate between the two so the
 * option lists, defaults, and derive() live in one place.
 */
export interface ExpenseScenarioFormData {
  name: string;
  companyTagId: string;
  amount: number;
  currency: ExpenseCurrency;
  taxRateId: string;
  markupPercentage: number;
  billable: boolean;
  expenseDate: string;
  recurring: boolean;
  expenseReceiptBlobId: string;
  additionalFields: { projectId: string; memberId: string; notes: string };
  /* Hidden API parity */
  deductibleStatus: string;
  deductiblePercentage: number;
  deductionQuestionable: boolean;
  recurringTime: number;
  recurringTimeUnit: string;
  invoiceId: string;
}

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
  additionalFields: z.object({
    projectId: z.string().optional().default(''),
    memberId: z.string().optional().default(''),
    notes: z.string().optional().default(''),
  }),
  deductibleStatus: z.string().optional().default('unknown'),
  deductiblePercentage: z.number().optional().default(100),
  deductionQuestionable: z.boolean().optional().default(false),
  recurringTime: z.number().optional().default(1),
  recurringTimeUnit: z.string().optional().default('month'),
  invoiceId: z.string().optional().default(''),
}) as unknown as z.ZodType<ExpenseScenarioFormData>;

const nestedInitial: ExpenseScenarioFormData = {
  name: expenseScenarioInitial.name,
  companyTagId: expenseScenarioInitial.companyTagId,
  amount: expenseScenarioInitial.amount,
  currency: expenseScenarioInitial.currency,
  taxRateId: expenseScenarioInitial.taxRateId,
  markupPercentage: expenseScenarioInitial.markupPercentage,
  billable: expenseScenarioInitial.billable,
  expenseDate: expenseScenarioInitial.expenseDate,
  recurring: expenseScenarioInitial.recurring,
  expenseReceiptBlobId: expenseScenarioInitial.expenseReceiptBlobId,
  additionalFields: { projectId: expenseScenarioInitial.projectId, memberId: expenseScenarioInitial.memberId, notes: expenseScenarioInitial.notes },
  deductibleStatus: expenseScenarioInitial.deductibleStatus,
  deductiblePercentage: expenseScenarioInitial.deductiblePercentage,
  deductionQuestionable: expenseScenarioInitial.deductionQuestionable,
  recurringTime: expenseScenarioInitial.recurringTime,
  recurringTimeUnit: expenseScenarioInitial.recurringTimeUnit,
  invoiceId: expenseScenarioInitial.invoiceId,
};

const flattenForDerive = (data: Readonly<Partial<ExpenseScenarioFormData>>): Partial<FlatExpenseFormData> => ({
  amount: data.amount,
  currency: data.currency,
  taxRateId: data.taxRateId,
  markupPercentage: data.markupPercentage,
});

const CATEGORY_OPTIONS = selectOptions(SHOWCASE_EXPENSE_CATEGORIES, { value: 'id', label: 'label', group: 'group' });
const TAX_OPTIONS = selectOptions(SHOWCASE_TAX_RATES, { value: 'id', label: 'label', group: () => 'SET TAX' });
const PROJECT_OPTIONS = selectOptions(SHOWCASE_PROJECTS, {
  value: 'id',
  label: (p) => `${p.icon} ${p.name}`,
  description: 'organization',
  color: 'color',
});
const MEMBER_OPTIONS = selectOptions(SHOWCASE_MEMBERS, { value: 'id', label: 'name', group: 'group', color: 'color', initials: 'initials' });

export const expenseScenarioFixture = (): DynamicFormFixture<ExpenseScenarioFormData, ExpenseDerived> => ({
  schema: {
    type: 'object',
    required: ['name', 'amount', 'currency', 'expenseDate'],
    properties: {
      name: { type: 'string', title: 'Name' },
      companyTagId: { type: 'string', title: 'Category' },
      amount: { type: 'number', title: 'Amount' },
      currency: { type: 'string', title: 'Currency', enum: ['GBP', 'ETB'] },
      /* Tax UI binds a single id; backend wraps as tax_rate_ids: [taxRateId] */
      taxRateId: { type: 'string', title: 'Tax' },
      markupPercentage: { type: 'number', title: 'Markup' },
      billable: { type: 'boolean', title: 'Billable' },
      expenseDate: { type: 'string', title: 'Date', format: 'date' },
      recurring: { type: 'boolean', title: 'Recurring' },
      expenseReceiptBlobId: { type: 'string', title: 'Receipt blob id' },
      excludingTaxLabel: { type: 'string', title: '' },
      salesPriceLabel: { type: 'string', title: '' },
      additionalFields: {
        type: 'object',
        title: 'Additional Fields',
        properties: {
          projectId: { type: 'string', title: 'Project' },
          memberId: { type: 'string', title: 'Member' },
          notes: { type: 'string', title: 'Note' },
        },
      },
      deductibleStatus: { type: 'string', title: 'Deductible Status' },
      deductiblePercentage: { type: 'number', title: 'Deductible %' },
      deductionQuestionable: { type: 'boolean', title: 'Deduction Questionable' },
      recurringTime: { type: 'number', title: 'Recurring Time' },
      recurringTimeUnit: { type: 'string', title: 'Recurring Time Unit' },
      invoiceId: { type: 'string', title: 'Invoice Id' },
    },
  },
  uiSchema: {
    'ui:rows': [
      ['name', 'companyTagId'],
      ['amount', 'taxRateId'],
      ['billable', 'markupPercentage'],
      ['expenseDate', 'recurring'],
      ['excludingTaxLabel'],
      ['salesPriceLabel'],
      [{ value: 'additionalFields', span: 2 }],
    ],
    name: { 'ui:widget': 'text', 'ui:placeholder': 'Travel expenses' },
    companyTagId: { 'ui:widget': 'select', 'ui:options': { optionSetKey: 'categories', searchable: true } },
    amount: { 'ui:widget': 'currency' },
    currency: { 'ui:widget': 'hidden' },
    taxRateId: { 'ui:widget': 'select', 'ui:options': { optionSetKey: 'taxRates', footerActionKey: 'manageTaxRates' } },
    markupPercentage: { 'ui:widget': 'numberInput', 'ui:options': { suffix: '%' } },
    billable: { 'ui:widget': 'switch' },
    expenseDate: { 'ui:widget': 'date' },
    recurring: { 'ui:widget': 'switch' },
    expenseReceiptBlobId: { 'ui:widget': 'hidden' },
    excludingTaxLabel: { 'ui:widget': 'derivedText', 'ui:options': { derivedKey: 'excludingTaxLabel', tone: 'muted' } },
    salesPriceLabel: { 'ui:widget': 'derivedText', 'ui:options': { derivedKey: 'salesPriceLabel', tone: 'default' } },
    additionalFields: {
      'ui:options': { collapsible: { title: 'Additional Fields', defaultOpen: false } },
      'ui:rows': [['projectId', 'memberId'], [{ value: 'notes', span: 2 }]],
      projectId: { 'ui:widget': 'combobox', 'ui:options': { optionSetKey: 'projects', placeholder: 'Select project…' } },
      memberId: { 'ui:widget': 'combobox', 'ui:options': { optionSetKey: 'members', placeholder: 'Select member…' } },
      notes: { 'ui:widget': 'textarea', 'ui:placeholder': 'Add a note…' },
    },
    /* Hidden API parity */
    deductibleStatus: { 'ui:widget': 'hidden' },
    deductiblePercentage: { 'ui:widget': 'hidden' },
    deductionQuestionable: { 'ui:widget': 'hidden' },
    recurringTime: { 'ui:widget': 'hidden' },
    recurringTimeUnit: { 'ui:widget': 'hidden' },
    invoiceId: { 'ui:widget': 'hidden' },
  },
  zodSchema: expenseScenarioZod,
  defaults: nestedInitial,
  derive: (formData) => deriveExpense(flattenForDerive(formData)),
  formContext: {
    optionSets: { categories: CATEGORY_OPTIONS, taxRates: TAX_OPTIONS, projects: PROJECT_OPTIONS, members: MEMBER_OPTIONS },
    actions: { manageTaxRates: { label: 'Manage Tax Rates', href: '/settings/tax_rates', actionId: 'manageTaxRates' } },
    locale: 'en-GB',
  },
});
