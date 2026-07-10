import { z } from 'zod';
import type { UiSchema, RJSFSchema } from '@rjsf/utils';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface PageCountFormData {
  pages: number;
}

const PAGES_SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['pages'],
  properties: {
    pages: { type: 'integer', title: 'Number of pages', minimum: 1, maximum: 50 },
  },
};

const PAGES_ZOD = z.object({ pages: z.number().int().min(1).max(50) }) as unknown as z.ZodType<PageCountFormData>;

const fixtureFor = (uiSchema: UiSchema, opts: { initial?: number } = {}): FormFixture<PageCountFormData> => ({
  schema: PAGES_SCHEMA,
  uiSchema,
  zodSchema: PAGES_ZOD,
  defaults: { pages: opts.initial ?? 7 },
});

export const plainPagesFixture = (): FormFixture<PageCountFormData> =>
  fixtureFor({
    pages: {
      'ui:widget': 'stepper',
      'ui:options': { unit: 'page', icon: 'fileText' },
    },
  });

export const prefilledPagesFixture = (): FormFixture<PageCountFormData> =>
  fixtureFor(
    {
      pages: {
        'ui:widget': 'stepper',
        'ui:options': { unit: 'page', icon: 'fileText' },
      },
    },
    { initial: 24 },
  );

export const minMaxPagesFixture = (): FormFixture<PageCountFormData> =>
  fixtureFor({
    pages: {
      'ui:widget': 'stepper',
      'ui:options': { unit: 'page' },
    },
  });

export const disabledPagesFixture = (): FormFixture<PageCountFormData> =>
  fixtureFor({
    pages: {
      'ui:widget': 'stepper',
      'ui:disabled': true,
      'ui:options': { unit: 'page', icon: 'fileText' },
    },
  });
