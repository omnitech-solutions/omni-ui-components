import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { z } from 'zod';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface ComposerFormData {
  f?: unknown;
}

type ComposerFixture = FormFixture<ComposerFormData>;

const FIELD: RJSFSchema = {
  type: 'string',
  title: 'Message',
  description: 'Sent when the form is saved.',
};
const ZOD = z.object({ f: z.any() }) as unknown as z.ZodType<ComposerFormData>;

const fixtureFor = (uiSchema: UiSchema, required = false): ComposerFixture => ({
  schema: { type: 'object', ...(required ? { required: ['f'] } : {}), properties: { f: FIELD } },
  uiSchema,
  zodSchema: ZOD,
  defaults: { f: 'A first draft' },
});

export const plainComposerFixture = (): ComposerFixture =>
  fixtureFor({ f: { 'ui:widget': 'composer' } });
export const requiredComposerFixture = (): ComposerFixture =>
  fixtureFor({ f: { 'ui:widget': 'composer' } }, true);
export const disabledComposerFixture = (): ComposerFixture =>
  fixtureFor({ f: { 'ui:widget': 'composer', 'ui:disabled': true } });
export const readOnlyComposerFixture = (): ComposerFixture =>
  fixtureFor({ f: { 'ui:widget': 'composer', 'ui:readonly': true } });
export const pillComposerFixture = (): ComposerFixture =>
  fixtureFor({ f: { 'ui:widget': 'composer', 'ui:options': { appearance: 'pill' } } });
