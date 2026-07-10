import { z } from 'zod';
import type { UiSchema } from '@rjsf/utils';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface MessageFormData {
  message: string;
}

const MESSAGE_SCHEMA = {
  type: 'object' as const,
  required: ['message'],
  properties: {
    message: { type: 'string' as const, title: 'Message', maxLength: 1000 },
  },
};

const MESSAGE_ZOD = z.object({ message: z.string() }) as unknown as z.ZodType<MessageFormData>;
const MESSAGE_ZOD_REQUIRED = z.object({
  message: z.string().min(1, "Message can't be blank"),
}) as unknown as z.ZodType<MessageFormData>;

const fixtureFor = (uiSchema: UiSchema, opts: { initial?: string; required?: boolean } = {}): FormFixture<MessageFormData> => ({
  schema: MESSAGE_SCHEMA,
  uiSchema,
  zodSchema: opts.required ? MESSAGE_ZOD_REQUIRED : MESSAGE_ZOD,
  defaults: { message: opts.initial ?? '' },
});

export const plainMessageFixture = (): FormFixture<MessageFormData> => fixtureFor({ message: { 'ui:widget': 'textarea' } });

export const placeholderMessageFixture = (): FormFixture<MessageFormData> =>
  fixtureFor({
    message: {
      'ui:widget': 'textarea',
      'ui:placeholder': "We're looking forward to working together…",
    },
  });

export const descriptionMessageFixture = (): FormFixture<MessageFormData> =>
  fixtureFor({
    message: {
      'ui:widget': 'textarea',
      'ui:description': 'Recipients see this in the email body.',
    },
  });

export const tallMessageFixture = (): FormFixture<MessageFormData> => fixtureFor({ message: { 'ui:widget': 'textarea', 'ui:options': { rows: 10 } } });

export const prefilledMessageFixture = (): FormFixture<MessageFormData> =>
  fixtureFor({ message: { 'ui:widget': 'textarea' } }, { initial: 'Hi Ada,\n\nWelcome to Omni. Glad to have you on board.' });

export const validationMessageFixture = (): FormFixture<MessageFormData> => fixtureFor({ message: { 'ui:widget': 'textarea' } }, { required: true });
