import { z } from 'zod';
import type { UiSchema, RJSFSchema } from '@rjsf/utils';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface ScoreFormData {
  score: number;
}

const SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['score'],
  properties: { score: { type: 'number', title: 'Score', minimum: 0, maximum: 100 } },
};

const ZOD = z.object({ score: z.coerce.number() }) as unknown as z.ZodType<ScoreFormData>;

const fixtureFor = (uiSchema: UiSchema, opts: { initial?: number } = {}): FormFixture<ScoreFormData> => ({
  schema: SCHEMA,
  uiSchema,
  zodSchema: ZOD,
  defaults: { score: opts.initial ?? 75 },
});

export const plainNumberFixture = (): FormFixture<ScoreFormData> => fixtureFor({ score: { 'ui:widget': 'numberInput' } });
export const thousandSeparatorNumberFixture = (): FormFixture<ScoreFormData> =>
  fixtureFor({ score: { 'ui:widget': 'numberInput', 'ui:options': { thousandSeparator: true } } }, { initial: 12345 });
export const withSuffixNumberFixture = (): FormFixture<ScoreFormData> =>
  fixtureFor({ score: { 'ui:widget': 'numberInput', 'ui:options': { suffix: '/100' } } });
