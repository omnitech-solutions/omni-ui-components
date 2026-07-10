import { z } from 'zod';
import type { UiSchema, RJSFSchema } from '@rjsf/utils';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface TimeFormData {
  start_time: string;
}

const SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['start_time'],
  properties: { start_time: { type: 'string', format: 'time', title: 'Start time' } },
};

const ZOD = z.object({ start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Pick a time') }) as unknown as z.ZodType<TimeFormData>;

const fixtureFor = (uiSchema: UiSchema, initial = ''): FormFixture<TimeFormData> => ({
  schema: SCHEMA,
  uiSchema,
  zodSchema: ZOD,
  defaults: { start_time: initial },
});

export const plainTimeFixture = (): FormFixture<TimeFormData> => fixtureFor({ start_time: { 'ui:widget': 'time' } });
export const prefilledTimeFixture = (): FormFixture<TimeFormData> => fixtureFor({ start_time: { 'ui:widget': 'time' } }, '09:30');
export const disabledTimeFixture = (): FormFixture<TimeFormData> => fixtureFor({ start_time: { 'ui:widget': 'time', 'ui:disabled': true } }, '09:30');
