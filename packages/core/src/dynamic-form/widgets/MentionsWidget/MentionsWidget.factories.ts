import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { z } from 'zod';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface MentionsFormData {
  f?: unknown;
}

type MentionsFixture = FormFixture<MentionsFormData> & {
  formContext: Record<string, unknown>;
  derive: () => Record<string, unknown>;
};

const FIELD: RJSFSchema = {
  type: 'string',
  title: 'Comment',
  description: 'Type @ to mention someone.',
};
const ZOD = z.object({ f: z.any() }) as unknown as z.ZodType<MentionsFormData>;
/** What the host supplies beside the schema: lists and trees are data in `formContext`, named by key. */
const FORM_CONTEXT = {
  optionSets: {
    people: [
      {
        value: 'alex',
        label: 'Alex Morgan',
        description: 'Design',
        avatarUrl: null,
        initials: 'AM',
        color: null,
        group: null,
        disabled: false,
      },
      {
        value: 'jamie',
        label: 'Jamie Chen',
        description: 'Engineering',
        avatarUrl: null,
        initials: 'JC',
        color: null,
        group: null,
        disabled: false,
      },
    ],
  },
  actions: {},
  locale: 'en',
};

const fixtureFor = (uiSchema: UiSchema, required = false): MentionsFixture => ({
  schema: { type: 'object', ...(required ? { required: ['f'] } : {}), properties: { f: FIELD } },
  uiSchema,
  zodSchema: ZOD,
  defaults: { f: 'Thanks @alex ' },
  formContext: FORM_CONTEXT,
  derive: () => ({}),
});

export const plainMentionsFixture = (): MentionsFixture =>
  fixtureFor({ f: { 'ui:widget': 'mentions', 'ui:options': { optionSetKey: 'people' } } });
export const requiredMentionsFixture = (): MentionsFixture =>
  fixtureFor({ f: { 'ui:widget': 'mentions', 'ui:options': { optionSetKey: 'people' } } }, true);
export const disabledMentionsFixture = (): MentionsFixture =>
  fixtureFor({
    f: { 'ui:widget': 'mentions', 'ui:options': { optionSetKey: 'people' }, 'ui:disabled': true },
  });
export const readOnlyMentionsFixture = (): MentionsFixture =>
  fixtureFor({
    f: { 'ui:widget': 'mentions', 'ui:options': { optionSetKey: 'people' }, 'ui:readonly': true },
  });
export const hashTriggerMentionsFixture = (): MentionsFixture =>
  fixtureFor({
    f: { 'ui:widget': 'mentions', 'ui:options': { optionSetKey: 'people', trigger: ['@', '#'] } },
  });
