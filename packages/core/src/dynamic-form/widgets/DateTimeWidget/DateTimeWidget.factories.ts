import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { z } from 'zod';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface StartsAtFormData {
  starts_at: string;
}

const SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['starts_at'],
  properties: { starts_at: { type: 'string', format: 'date-time', title: 'Starts at' } },
};

const ZOD = z.object({
  starts_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, 'Pick a date + time'),
}) as unknown as z.ZodType<StartsAtFormData>;

const fixtureFor = (uiSchema: UiSchema, initial = ''): FormFixture<StartsAtFormData> => ({
  schema: SCHEMA,
  uiSchema,
  zodSchema: ZOD,
  defaults: { starts_at: initial },
});

export const plainDateTimeFixture = (): FormFixture<StartsAtFormData> =>
  fixtureFor({ starts_at: { 'ui:widget': 'dateTime' } });
export const prefilledDateTimeFixture = (): FormFixture<StartsAtFormData> =>
  fixtureFor({ starts_at: { 'ui:widget': 'dateTime' } }, '2026-07-15T09:30');

/** `storage: 'instant'`: the form holds an ISO instant in UTC and the control shows it in local time. */
export const instantDateTimeFixture = (): FormFixture<StartsAtFormData> =>
  fixtureFor(
    { starts_at: { 'ui:widget': 'dateTime', 'ui:options': { storage: 'instant' } } },
    '2026-07-15T09:30:00.000Z',
  );
/** `min` and `max` bound the calendar. */
export const boundedDateTimeFixture = (): FormFixture<StartsAtFormData> =>
  fixtureFor(
    {
      starts_at: {
        'ui:widget': 'dateTime',
        'ui:options': { min: '2026-07-01', max: '2026-07-31' },
      },
    },
    '2026-07-15T09:30',
  );
export const readOnlyDateTimeFixture = (): FormFixture<StartsAtFormData> =>
  fixtureFor({ starts_at: { 'ui:widget': 'dateTime', 'ui:readonly': true } }, '2026-07-15T09:30');
