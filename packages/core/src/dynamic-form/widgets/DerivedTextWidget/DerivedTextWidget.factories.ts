import { z } from 'zod';
import type { UiSchema } from '@rjsf/utils';

import type { DynamicFormFixture, FormFixture } from '../../DynamicForm/DynamicForm.factories';

/**
 * Single-field fixture for DerivedTextWidget. The schema property is a
 * no-op string field; the widget itself reads
 * `formContext.derived[derivedKey]`. Stories drive the derived value
 * either by typing into a sibling input or by toggling formData
 * directly.
 */
export interface AmountFormData {
  amount: number;
}

interface AmountDerived {
  amountLabel: string;
  [key: string]: string;
}

const AMOUNT_SCHEMA = {
  type: 'object' as const,
  properties: {
    amount: { type: 'number' as const, title: 'Amount' },
    amountLabel: { type: 'string' as const, title: 'Formatted amount' },
  },
};

const AMOUNT_ZOD = z.object({ amount: z.number().nonnegative() }) as unknown as z.ZodType<AmountFormData>;

const formatAmount = (n: number): string => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number.isFinite(n) ? n : 0);

const deriveAmount = (formData: Readonly<Partial<AmountFormData>>): AmountDerived => {
  const amount = typeof formData.amount === 'number' ? formData.amount : 0;
  return { amountLabel: `${formatAmount(amount)} Excluding Tax` };
};

const fixtureFor = (uiSchemaOverrides: UiSchema = {}, initialAmount = 0): DynamicFormFixture<AmountFormData, AmountDerived> => ({
  schema: AMOUNT_SCHEMA,
  uiSchema: {
    'ui:rows': [['amount'], ['amountLabel']],
    amount: { 'ui:widget': 'numberInput' },
    amountLabel: { 'ui:widget': 'derivedText', 'ui:options': { derivedKey: 'amountLabel', tone: 'muted' } },
    ...uiSchemaOverrides,
  },
  zodSchema: AMOUNT_ZOD,
  defaults: { amount: initialAmount } as AmountFormData,
  derive: deriveAmount,
  formContext: { optionSets: {}, actions: {}, locale: 'en-GB' },
});

export const defaultDerivedTextFixture = (): DynamicFormFixture<AmountFormData, AmountDerived> => fixtureFor();
export const prefilledDerivedTextFixture = (): DynamicFormFixture<AmountFormData, AmountDerived> => fixtureFor({}, 1234.56);
export const successToneDerivedTextFixture = (): DynamicFormFixture<AmountFormData, AmountDerived> =>
  fixtureFor({ amountLabel: { 'ui:widget': 'derivedText', 'ui:options': { derivedKey: 'amountLabel', tone: 'success' } } }, 200);

/** Compatibility shim — story shell accepts FormFixture or DynamicFormFixture. */
export const formFixtureFromDerivedText = (): FormFixture<AmountFormData> => defaultDerivedTextFixture();
