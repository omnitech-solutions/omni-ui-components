import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { z } from 'zod';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';
import type { DateRangeValue } from './DateRangeField';

export interface PeriodFormData {
  period?: DateRangeValue;
}

const schemaFor = (required: boolean): RJSFSchema => ({
  type: 'object',
  ...(required ? { required: ['period'] } : {}),
  properties: {
    period: {
      type: 'object',
      title: 'Reporting period',
      description: 'The first and the last day, both included.',
      properties: {
        from: { type: 'string', format: 'date' },
        to: { type: 'string', format: 'date' },
      },
    },
  },
});

const ZOD = z.object({
  period: z.object({ from: z.string().optional(), to: z.string().optional() }).optional(),
}) as unknown as z.ZodType<PeriodFormData>;

const fixtureFor = (ui: UiSchema[string] = {}, required = false): FormFixture<PeriodFormData> => ({
  schema: schemaFor(required),
  uiSchema: { period: { 'ui:field': 'dateRange', ...ui } },
  zodSchema: ZOD,
  defaults: { period: { from: '2026-10-05', to: '2026-10-09' } },
});

export const plainPeriodFixture = (): FormFixture<PeriodFormData> => fixtureFor();
export const requiredPeriodFixture = (): FormFixture<PeriodFormData> => fixtureFor({}, true);
export const boundedPeriodFixture = (): FormFixture<PeriodFormData> =>
  fixtureFor({
    'ui:options': { min: '2026-10-01', max: '2026-10-31', placeholder: 'Any days in October' },
  });
export const disabledPeriodFixture = (): FormFixture<PeriodFormData> =>
  fixtureFor({ 'ui:disabled': true });
export const readOnlyPeriodFixture = (): FormFixture<PeriodFormData> =>
  fixtureFor({ 'ui:readonly': true });
