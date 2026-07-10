import { z } from 'zod';
import type { UiSchema, RJSFSchema } from '@rjsf/utils';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface AvatarFormData {
  avatar?: string;
}

export interface AttachmentsFormData {
  attachments?: string[];
}

const AVATAR_SCHEMA: RJSFSchema = {
  type: 'object',
  properties: { avatar: { type: 'string', title: 'Avatar' } },
};

const ATTACHMENTS_SCHEMA: RJSFSchema = {
  type: 'object',
  properties: { attachments: { type: 'array', title: 'Attachments', items: { type: 'string' } } },
};

const AVATAR_ZOD = z.object({ avatar: z.string().optional() }) as unknown as z.ZodType<AvatarFormData>;
const ATTACHMENTS_ZOD = z.object({ attachments: z.array(z.string()).optional() }) as unknown as z.ZodType<AttachmentsFormData>;

const singleFixture = (uiSchema: UiSchema): FormFixture<AvatarFormData> => ({ schema: AVATAR_SCHEMA, uiSchema, zodSchema: AVATAR_ZOD, defaults: {} });
const multiFixture = (uiSchema: UiSchema): FormFixture<AttachmentsFormData> => ({
  schema: ATTACHMENTS_SCHEMA,
  uiSchema,
  zodSchema: ATTACHMENTS_ZOD,
  defaults: {},
});

export const plainFileFixture = (): FormFixture<AvatarFormData> => singleFixture({ avatar: { 'ui:widget': 'file' } });
export const imageFileFixture = (): FormFixture<AvatarFormData> =>
  singleFixture({ avatar: { 'ui:widget': 'file', 'ui:options': { accept: 'image/*', maxSize: 5_000_000 } } });
export const multipleFileFixture = (): FormFixture<AttachmentsFormData> =>
  multiFixture({ attachments: { 'ui:widget': 'file', 'ui:options': { maxFiles: 5 } } });
