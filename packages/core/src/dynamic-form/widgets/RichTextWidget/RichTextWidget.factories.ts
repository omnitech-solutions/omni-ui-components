import { z } from 'zod';
import type { UiSchema, RJSFSchema } from '@rjsf/utils';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface DescFormData {
  description: string;
}

const SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['description'],
  properties: { description: { type: 'string', title: 'Description' } },
};

const ZOD = z.object({ description: z.string().min(1, 'Description is required') }) as unknown as z.ZodType<DescFormData>;

const fixtureFor = (uiSchema: UiSchema, initial = ''): FormFixture<DescFormData> => ({
  schema: SCHEMA,
  uiSchema,
  zodSchema: ZOD,
  defaults: { description: initial },
});

export const plainRichTextFixture = (): FormFixture<DescFormData> => fixtureFor({ description: { 'ui:widget': 'richText' } });
export const prefilledRichTextFixture = (): FormFixture<DescFormData> =>
  fixtureFor({ description: { 'ui:widget': 'richText' } }, '<p>Hello <strong>world</strong>. Some <em>rich</em> content.</p>');
