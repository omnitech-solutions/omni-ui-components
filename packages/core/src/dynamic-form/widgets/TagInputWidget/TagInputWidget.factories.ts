import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { z } from 'zod';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface TagsFormData {
  tags: string[];
}

const SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['tags'],
  properties: { tags: { type: 'array', title: 'Tags', items: { type: 'string' } } },
};

const ZOD = z.object({ tags: z.array(z.string()) }) as unknown as z.ZodType<TagsFormData>;

const fixtureFor = (uiSchema: UiSchema, initial: string[] = []): FormFixture<TagsFormData> => ({
  schema: SCHEMA,
  uiSchema,
  zodSchema: ZOD,
  defaults: { tags: initial },
});

export const plainTagsFixture = (): FormFixture<TagsFormData> =>
  fixtureFor({ tags: { 'ui:widget': 'tags' } });
export const prefilledTagsFixture = (): FormFixture<TagsFormData> =>
  fixtureFor({ tags: { 'ui:widget': 'tags' } }, ['react', 'typescript', 'tailwind']);
export const maxTagsFixture = (): FormFixture<TagsFormData> =>
  fixtureFor({ tags: { 'ui:widget': 'tags', 'ui:options': { maxItems: 3 } } });
