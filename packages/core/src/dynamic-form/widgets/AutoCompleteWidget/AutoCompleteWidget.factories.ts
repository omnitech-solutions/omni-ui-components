import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { z } from 'zod';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface AutoCompleteFormData {
  f?: unknown;
}

type AutoCompleteFixture = FormFixture<AutoCompleteFormData>;

const FIELD: RJSFSchema = {
  type: 'string',
  title: 'City',
  description: 'Type any city, or pick a suggestion.',
  examples: ['Amsterdam', 'Athens', 'Berlin'],
};
const ZOD = z.object({ f: z.any() }) as unknown as z.ZodType<AutoCompleteFormData>;

const fixtureFor = (uiSchema: UiSchema, required = false): AutoCompleteFixture => ({
  schema: { type: 'object', ...(required ? { required: ['f'] } : {}), properties: { f: FIELD } },
  uiSchema,
  zodSchema: ZOD,
  defaults: { f: 'Berlin' },
});

export const plainAutoCompleteFixture = (): AutoCompleteFixture =>
  fixtureFor({ f: { 'ui:widget': 'autocomplete' } });
export const requiredAutoCompleteFixture = (): AutoCompleteFixture =>
  fixtureFor({ f: { 'ui:widget': 'autocomplete' } }, true);
export const disabledAutoCompleteFixture = (): AutoCompleteFixture =>
  fixtureFor({ f: { 'ui:widget': 'autocomplete', 'ui:disabled': true } });
export const readOnlyAutoCompleteFixture = (): AutoCompleteFixture =>
  fixtureFor({ f: { 'ui:widget': 'autocomplete', 'ui:readonly': true } });
