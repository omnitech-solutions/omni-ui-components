import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { z } from 'zod';

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

const AVATAR_ZOD = z.object({
  // The form holds the real `File` (or a string in the `data-url` and `name` modes); the host uploads it on submit.
  avatar: z.union([z.instanceof(File), z.string()]).optional(),
}) as unknown as z.ZodType<AvatarFormData>;
const ATTACHMENTS_ZOD = z.object({
  attachments: z.array(z.union([z.instanceof(File), z.string()])).optional(),
}) as unknown as z.ZodType<AttachmentsFormData>;

const singleFixture = (uiSchema: UiSchema): FormFixture<AvatarFormData> => ({
  schema: AVATAR_SCHEMA,
  uiSchema,
  zodSchema: AVATAR_ZOD,
  defaults: {},
});
const multiFixture = (uiSchema: UiSchema): FormFixture<AttachmentsFormData> => ({
  schema: ATTACHMENTS_SCHEMA,
  uiSchema,
  zodSchema: ATTACHMENTS_ZOD,
  defaults: {},
});

export const plainFileFixture = (): FormFixture<AvatarFormData> =>
  singleFixture({ avatar: { 'ui:widget': 'file' } });
export const imageFileFixture = (): FormFixture<AvatarFormData> =>
  singleFixture({
    avatar: { 'ui:widget': 'file', 'ui:options': { accept: 'image/*', maxSize: 5_000_000 } },
  });
export const multipleFileFixture = (): FormFixture<AttachmentsFormData> =>
  multiFixture({ attachments: { 'ui:widget': 'file', 'ui:options': { maxFiles: 5 } } });

/** A compact button for a dense form; files can still be dropped on it. */
export const compactFileFixture = (): FormFixture<AvatarFormData> =>
  singleFixture({ avatar: { 'ui:widget': 'file', 'ui:options': { appearance: 'button' } } });
/** The form holds a `data:` string per file: pure JSON, for small files. */
export const dataUrlFileFixture = (): FormFixture<AvatarFormData> =>
  singleFixture({ avatar: { 'ui:widget': 'file', 'ui:options': { mode: 'data-url' } } });
/** The form holds the file name only. */
export const nameFileFixture = (): FormFixture<AvatarFormData> =>
  singleFixture({ avatar: { 'ui:widget': 'file', 'ui:options': { mode: 'name' } } });
export const readOnlyFileFixture = (): FormFixture<AvatarFormData> => ({
  ...singleFixture({
    avatar: { 'ui:widget': 'file', 'ui:options': { mode: 'name' }, 'ui:readonly': true },
  }),
  defaults: { avatar: 'portrait.png' } as AvatarFormData,
});
