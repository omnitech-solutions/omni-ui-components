import { z } from 'zod';
import type { UiSchema, RJSFSchema } from '@rjsf/utils';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface PhoneFormData {
  phone: string;
}

const SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['phone'],
  properties: { phone: { type: 'string', title: 'Phone' } },
};

const ZOD = z.object({ phone: z.string().regex(/^[+\d\s()-]{10,}$/, 'Enter a valid phone') }) as unknown as z.ZodType<PhoneFormData>;

const fixtureFor = (uiSchema: UiSchema, initial = ''): FormFixture<PhoneFormData> => ({
  schema: SCHEMA,
  uiSchema,
  zodSchema: ZOD,
  defaults: { phone: initial },
});

export const usPhoneFixture = (): FormFixture<PhoneFormData> => fixtureFor({ phone: { 'ui:widget': 'phone' } });
export const ukPhoneFixture = (): FormFixture<PhoneFormData> => fixtureFor({ phone: { 'ui:widget': 'phone', 'ui:options': { defaultDialCode: '+44' } } });
export const prefilledPhoneFixture = (): FormFixture<PhoneFormData> => fixtureFor({ phone: { 'ui:widget': 'phone' } }, '(555) 555-0100');
