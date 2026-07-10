import { z } from 'zod';
import type { UiSchema, RJSFSchema } from '@rjsf/utils';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface PlanFormData {
  plan: string;
}

const PLAN_SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['plan'],
  properties: {
    plan: {
      type: 'string',
      title: 'Billing plan',
      oneOf: [
        { const: 'free', title: 'Free' },
        { const: 'pro', title: 'Pro' },
        { const: 'team', title: 'Team' },
      ],
    },
  },
};

const PLAN_ZOD = z.object({ plan: z.string() }) as unknown as z.ZodType<PlanFormData>;
const PLAN_ZOD_REQUIRED = z.object({
  plan: z.string().min(1, 'Pick a plan'),
}) as unknown as z.ZodType<PlanFormData>;

const fixtureFor = (uiSchema: UiSchema, opts: { initial?: string; required?: boolean } = {}): FormFixture<PlanFormData> => ({
  schema: PLAN_SCHEMA,
  uiSchema,
  zodSchema: opts.required ? PLAN_ZOD_REQUIRED : PLAN_ZOD,
  defaults: { plan: opts.initial ?? '' },
});

export const plainPlanFixture = (): FormFixture<PlanFormData> => fixtureFor({ plan: { 'ui:widget': 'radio' } });

export const inlinePlanFixture = (): FormFixture<PlanFormData> => fixtureFor({ plan: { 'ui:widget': 'radio', 'ui:options': { inline: true } } });

export const descriptionPlanFixture = (): FormFixture<PlanFormData> =>
  fixtureFor({
    plan: {
      'ui:widget': 'radio',
      'ui:description': 'Switch any time — prorated automatically.',
    },
  });

export const prefilledPlanFixture = (): FormFixture<PlanFormData> => fixtureFor({ plan: { 'ui:widget': 'radio' } }, { initial: 'pro' });

export const validationPlanFixture = (): FormFixture<PlanFormData> => fixtureFor({ plan: { 'ui:widget': 'radio' } }, { required: true });

export const disabledOptionPlanFixture = (): FormFixture<PlanFormData> => fixtureFor({ plan: { 'ui:widget': 'radio', 'ui:enumDisabled': ['team'] } });
