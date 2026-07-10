import { z } from 'zod';
import type { UiSchema, RJSFSchema } from '@rjsf/utils';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface ChannelsFormData {
  channels: string[];
}

const CHANNELS_SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['channels'],
  properties: {
    channels: {
      type: 'array',
      title: 'Notification channels',
      uniqueItems: true,
      items: {
        type: 'string',
        oneOf: [
          { const: 'email', title: 'Email' },
          { const: 'sms', title: 'SMS' },
          { const: 'push', title: 'Push notifications' },
          { const: 'slack', title: 'Slack' },
        ],
      },
    },
  },
};

const CHANNELS_ZOD = z.object({ channels: z.array(z.string()) }) as unknown as z.ZodType<ChannelsFormData>;
const CHANNELS_ZOD_REQUIRED = z.object({
  channels: z.array(z.string()).min(1, 'Pick at least one channel'),
}) as unknown as z.ZodType<ChannelsFormData>;

const fixtureFor = (uiSchema: UiSchema, opts: { initial?: string[]; required?: boolean } = {}): FormFixture<ChannelsFormData> => ({
  schema: CHANNELS_SCHEMA,
  uiSchema,
  zodSchema: opts.required ? CHANNELS_ZOD_REQUIRED : CHANNELS_ZOD,
  defaults: { channels: opts.initial ?? [] },
});

export const plainChannelsFixture = (): FormFixture<ChannelsFormData> => fixtureFor({ channels: { 'ui:widget': 'checkboxes' } });

export const inlineChannelsFixture = (): FormFixture<ChannelsFormData> =>
  fixtureFor({ channels: { 'ui:widget': 'checkboxes', 'ui:options': { inline: true } } });

export const descriptionsChannelsFixture = (): FormFixture<ChannelsFormData> =>
  fixtureFor({
    channels: {
      'ui:widget': 'checkboxes',
      'ui:options': {
        optionDescriptions: {
          email: 'Daily digest at 9am.',
          sms: 'Mobile alerts for urgent items.',
          push: 'Browser + desktop.',
          slack: 'Routed to your default channel.',
        },
      },
    },
  });

export const prefilledChannelsFixture = (): FormFixture<ChannelsFormData> =>
  fixtureFor({ channels: { 'ui:widget': 'checkboxes' } }, { initial: ['email', 'push'] });

export const validationChannelsFixture = (): FormFixture<ChannelsFormData> => fixtureFor({ channels: { 'ui:widget': 'checkboxes' } }, { required: true });

export const disabledOptionChannelsFixture = (): FormFixture<ChannelsFormData> =>
  fixtureFor({ channels: { 'ui:widget': 'checkboxes', 'ui:enumDisabled': ['slack'] } });
