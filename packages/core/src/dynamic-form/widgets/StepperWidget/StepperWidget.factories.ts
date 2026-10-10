import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { FileText } from 'lucide-react';
import * as React from 'react';
import { z } from 'zod';

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

const PAGES_ZOD = z.object({
  pages: z.number().int().min(1).max(50),
}) as unknown as z.ZodType<PageCountFormData>;

const fixtureFor = (
  uiSchema: UiSchema,
  opts: { initial?: number } = {},
): FormFixture<PageCountFormData> & { formContext: Record<string, unknown> } => ({
  schema: PAGES_SCHEMA,
  uiSchema,
  zodSchema: PAGES_ZOD,
  defaults: { pages: opts.initial ?? 7 },
  // The icon is a node the host supplies; the schema only names it (`ui:options.iconKey`).
  formContext: {
    optionSets: {},
    actions: {},
    locale: 'en',
    icons: { pages: React.createElement(FileText) },
  },
  derive: () => ({}),
});

export const plainPagesFixture = (): FormFixture<PageCountFormData> =>
  fixtureFor({
    pages: {
      'ui:widget': 'stepper',
      'ui:options': { unit: 'page', iconKey: 'pages' },
    },
  });

export const prefilledPagesFixture = (): FormFixture<PageCountFormData> =>
  fixtureFor(
    {
      pages: {
        'ui:widget': 'stepper',
        'ui:options': { unit: 'page', iconKey: 'pages' },
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
      'ui:options': { unit: 'page', iconKey: 'pages' },
    },
  });
