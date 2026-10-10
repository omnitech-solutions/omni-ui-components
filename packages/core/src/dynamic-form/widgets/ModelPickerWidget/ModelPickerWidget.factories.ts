import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { z } from 'zod';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface ModelPickerFormData {
  f?: unknown;
}

type ModelPickerFixture = FormFixture<ModelPickerFormData> & {
  formContext: Record<string, unknown>;
};

const FIELD: RJSFSchema = {
  type: 'string',
  title: 'Model',
  description: 'Used for new conversations.',
};
const ZOD = z.object({ f: z.any() }) as unknown as z.ZodType<ModelPickerFormData>;
/** What the host supplies beside the schema: lists and trees are data in `formContext`, named by key. */
const FORM_CONTEXT = {
  optionSets: {},
  actions: {},
  locale: 'en',
  modelSets: {
    chat: [
      { id: 'fast', name: 'Fast', description: 'Quick answers' },
      { id: 'deep', name: 'Deep', description: 'Careful answers' },
    ],
  },
};

const fixtureFor = (uiSchema: UiSchema, required = false): ModelPickerFixture => ({
  schema: { type: 'object', ...(required ? { required: ['f'] } : {}), properties: { f: FIELD } },
  uiSchema,
  zodSchema: ZOD,
  defaults: { f: 'deep' },
  formContext: FORM_CONTEXT,
  derive: () => ({}),
});

export const plainModelPickerFixture = (): ModelPickerFixture =>
  fixtureFor({ f: { 'ui:widget': 'modelPicker', 'ui:options': { modelSetKey: 'chat' } } });
export const requiredModelPickerFixture = (): ModelPickerFixture =>
  fixtureFor({ f: { 'ui:widget': 'modelPicker', 'ui:options': { modelSetKey: 'chat' } } }, true);
export const disabledModelPickerFixture = (): ModelPickerFixture =>
  fixtureFor({
    f: { 'ui:widget': 'modelPicker', 'ui:options': { modelSetKey: 'chat' }, 'ui:disabled': true },
  });
export const readOnlyModelPickerFixture = (): ModelPickerFixture =>
  fixtureFor({
    f: { 'ui:widget': 'modelPicker', 'ui:options': { modelSetKey: 'chat' }, 'ui:readonly': true },
  });
