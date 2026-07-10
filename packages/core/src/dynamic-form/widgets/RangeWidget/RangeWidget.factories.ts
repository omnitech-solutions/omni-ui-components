import { z } from 'zod';
import type { UiSchema, RJSFSchema } from '@rjsf/utils';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface VolumeFormData {
  volume: number;
}

const VOLUME_SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['volume'],
  properties: {
    volume: { type: 'integer', title: 'Volume', minimum: 0, maximum: 100, multipleOf: 1 },
  },
};

const VOLUME_ZOD = z.object({ volume: z.number().int().min(0).max(100) }) as unknown as z.ZodType<VolumeFormData>;

const fixtureFor = (uiSchema: UiSchema, opts: { initial?: number } = {}): FormFixture<VolumeFormData> => ({
  schema: VOLUME_SCHEMA,
  uiSchema,
  zodSchema: VOLUME_ZOD,
  defaults: { volume: opts.initial ?? 35 },
});

export const plainVolumeFixture = (): FormFixture<VolumeFormData> => fixtureFor({ volume: { 'ui:widget': 'range' } });

export const descriptionVolumeFixture = (): FormFixture<VolumeFormData> =>
  fixtureFor({
    volume: {
      'ui:widget': 'range',
      'ui:description': 'Drag the thumb to set output volume in percent.',
    },
  });

export const fineStepVolumeFixture = (): FormFixture<VolumeFormData> =>
  fixtureFor({
    volume: { 'ui:widget': 'range', 'ui:options': { step: 5 } },
  });

export const prefilledVolumeFixture = (): FormFixture<VolumeFormData> => fixtureFor({ volume: { 'ui:widget': 'range' } }, { initial: 80 });

export const disabledVolumeFixture = (): FormFixture<VolumeFormData> => fixtureFor({ volume: { 'ui:widget': 'range', 'ui:disabled': true } });
