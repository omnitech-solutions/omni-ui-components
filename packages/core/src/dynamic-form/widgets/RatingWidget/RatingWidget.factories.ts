import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { z } from 'zod';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface RatingFormData {
  f?: unknown;
}

type RatingFixture = FormFixture<RatingFormData>;

const FIELD: RJSFSchema = {
  type: 'integer',
  title: 'Score',
  description: 'How did it go?',
  minimum: 0,
  maximum: 5,
};
const ZOD = z.object({ f: z.any() }) as unknown as z.ZodType<RatingFormData>;

const fixtureFor = (uiSchema: UiSchema, required = false): RatingFixture => ({
  schema: { type: 'object', ...(required ? { required: ['f'] } : {}), properties: { f: FIELD } },
  uiSchema,
  zodSchema: ZOD,
  defaults: { f: 3 },
});

export const plainRatingFixture = (): RatingFixture => fixtureFor({ f: { 'ui:widget': 'rating' } });
export const requiredRatingFixture = (): RatingFixture =>
  fixtureFor({ f: { 'ui:widget': 'rating' } }, true);
export const disabledRatingFixture = (): RatingFixture =>
  fixtureFor({ f: { 'ui:widget': 'rating', 'ui:disabled': true } });
export const readOnlyRatingFixture = (): RatingFixture =>
  fixtureFor({ f: { 'ui:widget': 'rating', 'ui:readonly': true } });
export const tenMarksRatingFixture = (): RatingFixture =>
  fixtureFor({ f: { 'ui:widget': 'rating', 'ui:options': { count: 10 } } });
export const smallRatingFixture = (): RatingFixture =>
  fixtureFor({ f: { 'ui:widget': 'rating', 'ui:options': { size: 'sm' } } });
