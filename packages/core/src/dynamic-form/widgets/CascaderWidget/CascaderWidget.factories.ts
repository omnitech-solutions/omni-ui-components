import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { z } from 'zod';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface CascaderFormData {
  f?: unknown;
}

type CascaderFixture = FormFixture<CascaderFormData> & {
  formContext: Record<string, unknown>;
  derive: () => Record<string, unknown>;
};

const FIELD: RJSFSchema = {
  type: 'array',
  title: 'Region',
  description: 'Continent, then country.',
  items: { type: 'string' },
};
const ZOD = z.object({ f: z.any() }) as unknown as z.ZodType<CascaderFormData>;
/** What the host supplies beside the schema: lists and trees are data in `formContext`, named by key. */
const FORM_CONTEXT = {
  optionSets: {},
  actions: {},
  locale: 'en',
  optionTrees: {
    regions: [
      {
        value: 'europe',
        label: 'Europe',
        children: [
          { value: 'france', label: 'France' },
          { value: 'spain', label: 'Spain' },
        ],
      },
      { value: 'asia', label: 'Asia', children: [{ value: 'japan', label: 'Japan' }] },
    ],
  },
};

const fixtureFor = (uiSchema: UiSchema, required = false): CascaderFixture => ({
  schema: { type: 'object', ...(required ? { required: ['f'] } : {}), properties: { f: FIELD } },
  uiSchema,
  zodSchema: ZOD,
  defaults: { f: ['europe', 'spain'] },
  formContext: FORM_CONTEXT,
  derive: () => ({}),
});

export const plainCascaderFixture = (): CascaderFixture =>
  fixtureFor({ f: { 'ui:widget': 'cascader', 'ui:options': { optionTreeKey: 'regions' } } });
export const requiredCascaderFixture = (): CascaderFixture =>
  fixtureFor({ f: { 'ui:widget': 'cascader', 'ui:options': { optionTreeKey: 'regions' } } }, true);
export const disabledCascaderFixture = (): CascaderFixture =>
  fixtureFor({
    f: { 'ui:widget': 'cascader', 'ui:options': { optionTreeKey: 'regions' }, 'ui:disabled': true },
  });
export const readOnlyCascaderFixture = (): CascaderFixture =>
  fixtureFor({
    f: { 'ui:widget': 'cascader', 'ui:options': { optionTreeKey: 'regions' }, 'ui:readonly': true },
  });
export const changeOnSelectCascaderFixture = (): CascaderFixture =>
  fixtureFor({
    f: {
      'ui:widget': 'cascader',
      'ui:options': { optionTreeKey: 'regions', changeOnSelect: true },
    },
  });
