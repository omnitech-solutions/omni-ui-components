import { z } from 'zod';
import type { UiSchema } from '@rjsf/utils';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface SubjectFormData {
  subject: string;
}

const SUBJECT_SCHEMA = {
  type: 'object' as const,
  required: ['subject'],
  properties: {
    subject: { type: 'string' as const, title: 'Email Subject', maxLength: 200 },
  },
};

const SUBJECT_ZOD = z.object({ subject: z.string() }) as unknown as z.ZodType<SubjectFormData>;
const SUBJECT_ZOD_REQUIRED = z.object({
  subject: z.string().min(1, "Subject can't be blank"),
}) as unknown as z.ZodType<SubjectFormData>;

const fixtureFor = (uiSchema: UiSchema, opts: { initial?: string; required?: boolean } = {}): FormFixture<SubjectFormData> => ({
  schema: SUBJECT_SCHEMA,
  uiSchema,
  zodSchema: opts.required ? SUBJECT_ZOD_REQUIRED : SUBJECT_ZOD,
  defaults: { subject: opts.initial ?? '' },
});

export const plainSubjectFixture = (): FormFixture<SubjectFormData> => fixtureFor({ subject: { 'ui:widget': 'text' } });

export const placeholderSubjectFixture = (): FormFixture<SubjectFormData> =>
  fixtureFor({ subject: { 'ui:widget': 'text', 'ui:placeholder': 'New message from …' } });

export const descriptionSubjectFixture = (): FormFixture<SubjectFormData> =>
  fixtureFor({
    subject: {
      'ui:widget': 'text',
      'ui:description': 'Recipients see this in their inbox preview.',
    },
  });

export const commitOnEnterSubjectFixture = (): FormFixture<SubjectFormData> =>
  fixtureFor({ subject: { 'ui:widget': 'text', 'ui:options': { commitOnEnter: true } } });

export const prefilledSubjectFixture = (): FormFixture<SubjectFormData> => fixtureFor({ subject: { 'ui:widget': 'text' } }, { initial: 'Welcome to Omni' });

export const validationSubjectFixture = (): FormFixture<SubjectFormData> => fixtureFor({ subject: { 'ui:widget': 'text' } }, { required: true });
