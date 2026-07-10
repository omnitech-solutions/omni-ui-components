import { z } from 'zod';
import type { UiSchema, RJSFSchema } from '@rjsf/utils';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface DueDateFormData {
  due_date: string;
}

const SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['due_date'],
  properties: { due_date: { type: 'string', format: 'date', title: 'Due date' } },
};

const ZOD = z.object({ due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date') }) as unknown as z.ZodType<DueDateFormData>;

const fixtureFor = (uiSchema: UiSchema, opts: { initial?: string } = {}): FormFixture<DueDateFormData> => ({
  schema: SCHEMA,
  uiSchema,
  zodSchema: ZOD,
  defaults: { due_date: opts.initial ?? '' },
});

export const plainDateFixture = (): FormFixture<DueDateFormData> => fixtureFor({ due_date: { 'ui:widget': 'date' } });
export const prefilledDateFixture = (): FormFixture<DueDateFormData> => fixtureFor({ due_date: { 'ui:widget': 'date' } }, { initial: '2026-07-15' });
export const disabledDateFixture = (): FormFixture<DueDateFormData> =>
  fixtureFor({ due_date: { 'ui:widget': 'date', 'ui:disabled': true } }, { initial: '2026-07-15' });
