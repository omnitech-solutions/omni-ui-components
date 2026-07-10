import { z } from 'zod';
import type { UiSchema, RJSFSchema } from '@rjsf/utils';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface OtpFormData {
  code: string;
}

const SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['code'],
  properties: { code: { type: 'string', title: 'Verification code', maxLength: 6 } },
};

const ZOD = z.object({ code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code') }) as unknown as z.ZodType<OtpFormData>;

const fixtureFor = (uiSchema: UiSchema, initial = ''): FormFixture<OtpFormData> => ({ schema: SCHEMA, uiSchema, zodSchema: ZOD, defaults: { code: initial } });

export const plainOtpFixture = (): FormFixture<OtpFormData> => fixtureFor({ code: { 'ui:widget': 'otp' } });
export const prefilledOtpFixture = (): FormFixture<OtpFormData> => fixtureFor({ code: { 'ui:widget': 'otp' } }, '123456');
export const fourDigitOtpFixture = (): FormFixture<OtpFormData> => fixtureFor({ code: { 'ui:widget': 'otp', 'ui:options': { length: 4 } } });
