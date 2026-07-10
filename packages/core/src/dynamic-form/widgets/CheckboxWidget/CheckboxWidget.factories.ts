import { z } from 'zod';
import type { UiSchema, RJSFSchema } from '@rjsf/utils';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface TosFormData {
  agreed: boolean;
}

const TOS_SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['agreed'],
  properties: {
    agreed: {
      type: 'boolean',
      title: 'I agree to the Terms of Service',
    },
  },
};

const TOS_ZOD = z.object({ agreed: z.boolean() }) as unknown as z.ZodType<TosFormData>;
const TOS_ZOD_REQUIRED = z.object({
  agreed: z.literal(true, { error: 'You must agree to continue' }),
}) as unknown as z.ZodType<TosFormData>;

const fixtureFor = (uiSchema: UiSchema, opts: { initial?: boolean; required?: boolean } = {}): FormFixture<TosFormData> => ({
  schema: TOS_SCHEMA,
  uiSchema,
  zodSchema: opts.required ? TOS_ZOD_REQUIRED : TOS_ZOD,
  defaults: { agreed: opts.initial ?? false },
});

export const plainTosFixture = (): FormFixture<TosFormData> => fixtureFor({ agreed: { 'ui:widget': 'checkbox' } });

export const prefilledTosFixture = (): FormFixture<TosFormData> => fixtureFor({ agreed: { 'ui:widget': 'checkbox' } }, { initial: true });

export const validationTosFixture = (): FormFixture<TosFormData> => fixtureFor({ agreed: { 'ui:widget': 'checkbox' } }, { required: true });
