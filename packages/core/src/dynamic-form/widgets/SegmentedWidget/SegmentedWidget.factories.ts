import { z } from 'zod';
import type { UiSchema, RJSFSchema } from '@rjsf/utils';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface ToneFormData {
  tone: string;
}

const TONE_SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['tone'],
  properties: {
    tone: {
      type: 'string',
      title: 'Tone',
      oneOf: [
        { const: 'casual', title: 'Casual' },
        { const: 'friendly', title: 'Friendly' },
        { const: 'professional', title: 'Professional' },
      ],
    },
  },
};

const TONE_ZOD = z.object({ tone: z.string() }) as unknown as z.ZodType<ToneFormData>;
const TONE_ZOD_REQUIRED = z.object({
  tone: z.string().min(1, 'Pick a tone'),
}) as unknown as z.ZodType<ToneFormData>;

const fixtureFor = (uiSchema: UiSchema, opts: { initial?: string; required?: boolean } = {}): FormFixture<ToneFormData> => ({
  schema: TONE_SCHEMA,
  uiSchema,
  zodSchema: opts.required ? TONE_ZOD_REQUIRED : TONE_ZOD,
  defaults: { tone: opts.initial ?? 'friendly' },
});

export const plainToneFixture = (): FormFixture<ToneFormData> => fixtureFor({ tone: { 'ui:widget': 'segmented' } });

export const twoOptionToneFixture = (): FormFixture<ToneFormData> => ({
  schema: {
    type: 'object',
    properties: {
      tone: {
        type: 'string',
        title: 'Auto-publish',
        oneOf: [
          { const: 'yes', title: 'Yes' },
          { const: 'no', title: 'No' },
        ],
      },
    },
  },
  uiSchema: { tone: { 'ui:widget': 'segmented' } },
  zodSchema: TONE_ZOD,
  defaults: { tone: 'yes' },
});

export const validationToneFixture = (): FormFixture<ToneFormData> => fixtureFor({ tone: { 'ui:widget': 'segmented' } }, { required: true, initial: '' });
