import { z } from 'zod';
import type { UiSchema, RJSFSchema } from '@rjsf/utils';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface StackFormData {
  stack: string[];
}

const SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['stack'],
  properties: {
    stack: {
      type: 'array',
      title: 'Stack',
      uniqueItems: true,
      items: {
        type: 'string',
        oneOf: [
          { const: 'react', title: 'React' },
          { const: 'typescript', title: 'TypeScript' },
          { const: 'tailwind', title: 'Tailwind' },
          { const: 'next', title: 'Next.js' },
          { const: 'remix', title: 'Remix' },
          { const: 'astro', title: 'Astro' },
        ],
      },
    },
  },
};

const ZOD = z.object({ stack: z.array(z.string()) }) as unknown as z.ZodType<StackFormData>;
const fixtureFor = (uiSchema: UiSchema, initial: string[] = []): FormFixture<StackFormData> => ({
  schema: SCHEMA,
  uiSchema,
  zodSchema: ZOD,
  defaults: { stack: initial },
});

export const plainMultiSelectFixture = (): FormFixture<StackFormData> => fixtureFor({ stack: { 'ui:widget': 'multiSelect' } });
export const searchableMultiSelectFixture = (): FormFixture<StackFormData> =>
  fixtureFor({ stack: { 'ui:widget': 'multiSelect', 'ui:options': { searchable: true } } });
export const prefilledMultiSelectFixture = (): FormFixture<StackFormData> => fixtureFor({ stack: { 'ui:widget': 'multiSelect' } }, ['react', 'typescript']);
