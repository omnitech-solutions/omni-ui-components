import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { z } from 'zod';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface CalendarFormData {
  f?: unknown;
}

type CalendarFixture = FormFixture<CalendarFormData>;

const FIELD: RJSFSchema = {
  type: 'string',
  title: 'Start date',
  description: 'The first working day.',
  format: 'date',
};
const ZOD = z.object({ f: z.any() }) as unknown as z.ZodType<CalendarFormData>;

const fixtureFor = (uiSchema: UiSchema, required = false): CalendarFixture => ({
  schema: { type: 'object', ...(required ? { required: ['f'] } : {}), properties: { f: FIELD } },
  uiSchema,
  zodSchema: ZOD,
  defaults: { f: '2026-10-09' },
});

export const plainCalendarFixture = (): CalendarFixture =>
  fixtureFor({ f: { 'ui:widget': 'calendar' } });
export const requiredCalendarFixture = (): CalendarFixture =>
  fixtureFor({ f: { 'ui:widget': 'calendar' } }, true);
export const disabledCalendarFixture = (): CalendarFixture =>
  fixtureFor({ f: { 'ui:widget': 'calendar', 'ui:disabled': true } });
export const readOnlyCalendarFixture = (): CalendarFixture =>
  fixtureFor({ f: { 'ui:widget': 'calendar', 'ui:readonly': true } });
export const boundedCalendarFixture = (): CalendarFixture =>
  fixtureFor({
    f: { 'ui:widget': 'calendar', 'ui:options': { min: '2026-10-05', max: '2026-10-23' } },
  });
