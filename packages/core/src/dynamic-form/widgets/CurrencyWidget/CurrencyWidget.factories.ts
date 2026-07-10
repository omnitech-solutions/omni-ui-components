import { z } from 'zod';
import type { UiSchema, RJSFSchema } from '@rjsf/utils';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface BudgetFormData {
  budget: number;
}

const SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['budget'],
  properties: { budget: { type: 'number', title: 'Monthly budget', minimum: 0 } },
};

const ZOD = z.object({ budget: z.coerce.number().nonnegative() }) as unknown as z.ZodType<BudgetFormData>;

const fixtureFor = (uiSchema: UiSchema, initial = 0): FormFixture<BudgetFormData> => ({
  schema: SCHEMA,
  uiSchema,
  zodSchema: ZOD,
  defaults: { budget: initial },
});

export const usdBudgetFixture = (): FormFixture<BudgetFormData> => fixtureFor({ budget: { 'ui:widget': 'currency', 'ui:options': { currency: 'USD' } } });
export const eurBudgetFixture = (): FormFixture<BudgetFormData> =>
  fixtureFor({ budget: { 'ui:widget': 'currency', 'ui:options': { currency: 'EUR', locale: 'de-DE' } } }, 1500);
export const jpyBudgetFixture = (): FormFixture<BudgetFormData> =>
  fixtureFor({ budget: { 'ui:widget': 'currency', 'ui:options': { currency: 'JPY', locale: 'ja-JP' } } }, 9999);
