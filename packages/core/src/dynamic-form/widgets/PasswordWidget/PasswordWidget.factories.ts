import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { z } from 'zod';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface PasswordFormData {
  f?: unknown;
}

type PasswordFixture = FormFixture<PasswordFormData>;

const FIELD: RJSFSchema = {
  type: 'string',
  title: 'Password',
  description: 'At least 8 characters.',
};
const ZOD = z.object({ f: z.any() }) as unknown as z.ZodType<PasswordFormData>;

const fixtureFor = (uiSchema: UiSchema, required = false): PasswordFixture => ({
  schema: { type: 'object', ...(required ? { required: ['f'] } : {}), properties: { f: FIELD } },
  uiSchema,
  zodSchema: ZOD,
  defaults: { f: 'correct horse' },
});

export const plainPasswordFixture = (): PasswordFixture =>
  fixtureFor({ f: { 'ui:widget': 'password' } });
export const requiredPasswordFixture = (): PasswordFixture =>
  fixtureFor({ f: { 'ui:widget': 'password' } }, true);
export const disabledPasswordFixture = (): PasswordFixture =>
  fixtureFor({ f: { 'ui:widget': 'password', 'ui:disabled': true } });
export const readOnlyPasswordFixture = (): PasswordFixture =>
  fixtureFor({ f: { 'ui:widget': 'password', 'ui:readonly': true } });
export const noTogglePasswordFixture = (): PasswordFixture =>
  fixtureFor({ f: { 'ui:widget': 'password', 'ui:options': { toggleable: false } } });
export const newPasswordPasswordFixture = (): PasswordFixture =>
  fixtureFor({ f: { 'ui:widget': 'password', 'ui:options': { autocomplete: 'new-password' } } });
