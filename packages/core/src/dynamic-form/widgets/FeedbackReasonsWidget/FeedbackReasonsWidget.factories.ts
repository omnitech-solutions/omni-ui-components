import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { z } from 'zod';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface FeedbackReasonsFormData {
  f?: string[];
}

const FIELD: RJSFSchema = {
  type: 'array',
  title: 'What went wrong?',
  description: 'Choose every reason that applies.',
  uniqueItems: true,
  items: {
    type: 'string',
    oneOf: [
      { const: 'slow', title: 'Too slow' },
      { const: 'wrong', title: 'Not correct' },
      { const: 'unclear', title: 'Hard to follow' },
    ],
  },
};
const ZOD = z.object({
  f: z.array(z.string()).optional(),
}) as unknown as z.ZodType<FeedbackReasonsFormData>;

const fixtureFor = (
  uiSchema: UiSchema,
  required = false,
): FormFixture<FeedbackReasonsFormData> => ({
  schema: { type: 'object', ...(required ? { required: ['f'] } : {}), properties: { f: FIELD } },
  uiSchema,
  zodSchema: ZOD,
  defaults: { f: ['wrong'] },
});

export const plainFeedbackReasonsFixture = (): FormFixture<FeedbackReasonsFormData> =>
  fixtureFor({ f: { 'ui:widget': 'feedbackReasons' } });
export const requiredFeedbackReasonsFixture = (): FormFixture<FeedbackReasonsFormData> =>
  fixtureFor({ f: { 'ui:widget': 'feedbackReasons' } }, true);
export const disabledFeedbackReasonsFixture = (): FormFixture<FeedbackReasonsFormData> =>
  fixtureFor({ f: { 'ui:widget': 'feedbackReasons', 'ui:disabled': true } });
export const readOnlyFeedbackReasonsFixture = (): FormFixture<FeedbackReasonsFormData> =>
  fixtureFor({ f: { 'ui:widget': 'feedbackReasons', 'ui:readonly': true } });
