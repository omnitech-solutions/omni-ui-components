import { z } from 'zod';
import type { UiSchema, RJSFSchema } from '@rjsf/utils';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface StartsAtFormData {
  starts_at: string;
}

const SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['starts_at'],
  properties: { starts_at: { type: 'string', format: 'date-time', title: 'Starts at' } },
};

const ZOD = z.object({ starts_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, 'Pick a date + time') }) as unknown as z.ZodType<StartsAtFormData>;

const fixtureFor = (uiSchema: UiSchema, initial = ''): FormFixture<StartsAtFormData> => ({
  schema: SCHEMA,
  uiSchema,
  zodSchema: ZOD,
  defaults: { starts_at: initial },
});

export const plainDateTimeFixture = (): FormFixture<StartsAtFormData> => fixtureFor({ starts_at: { 'ui:widget': 'dateTime' } });
export const prefilledDateTimeFixture = (): FormFixture<StartsAtFormData> => fixtureFor({ starts_at: { 'ui:widget': 'dateTime' } }, '2026-07-15T09:30');
