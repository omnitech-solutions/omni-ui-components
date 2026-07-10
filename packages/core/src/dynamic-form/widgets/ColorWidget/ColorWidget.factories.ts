import { z } from 'zod';
import type { UiSchema, RJSFSchema } from '@rjsf/utils';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface ColorFormData {
  brand_color: string;
}

const SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['brand_color'],
  properties: { brand_color: { type: 'string', format: 'color', title: 'Brand color' } },
};

const ZOD = z.object({ brand_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Pick a color') }) as unknown as z.ZodType<ColorFormData>;

const fixtureFor = (uiSchema: UiSchema, initial = '#22c55e'): FormFixture<ColorFormData> => ({
  schema: SCHEMA,
  uiSchema,
  zodSchema: ZOD,
  defaults: { brand_color: initial },
});

export const plainColorFixture = (): FormFixture<ColorFormData> => fixtureFor({ brand_color: { 'ui:widget': 'color' } });
export const redColorFixture = (): FormFixture<ColorFormData> => fixtureFor({ brand_color: { 'ui:widget': 'color' } }, '#ef4444');
export const disabledColorFixture = (): FormFixture<ColorFormData> => fixtureFor({ brand_color: { 'ui:widget': 'color', 'ui:disabled': true } }, '#3b82f6');
