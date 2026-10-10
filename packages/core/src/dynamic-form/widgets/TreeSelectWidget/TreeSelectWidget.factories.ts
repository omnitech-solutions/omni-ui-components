import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { z } from 'zod';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface TreeSelectFormData {
  f?: unknown;
}

type TreeSelectFixture = FormFixture<TreeSelectFormData> & {
  formContext: Record<string, unknown>;
  derive: () => Record<string, unknown>;
};

const FIELD: RJSFSchema = {
  type: 'string',
  title: 'Region',
  description: 'Open a continent to see its countries.',
};
const ZOD = z.object({ f: z.any() }) as unknown as z.ZodType<TreeSelectFormData>;
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

const fixtureFor = (uiSchema: UiSchema, required = false): TreeSelectFixture => ({
  schema: { type: 'object', ...(required ? { required: ['f'] } : {}), properties: { f: FIELD } },
  uiSchema,
  zodSchema: ZOD,
  defaults: { f: 'asia' },
  formContext: FORM_CONTEXT,
  derive: () => ({}),
});

export const plainTreeSelectFixture = (): TreeSelectFixture =>
  fixtureFor({ f: { 'ui:widget': 'treeSelect', 'ui:options': { optionTreeKey: 'regions' } } });
export const requiredTreeSelectFixture = (): TreeSelectFixture =>
  fixtureFor(
    { f: { 'ui:widget': 'treeSelect', 'ui:options': { optionTreeKey: 'regions' } } },
    true,
  );
export const disabledTreeSelectFixture = (): TreeSelectFixture =>
  fixtureFor({
    f: {
      'ui:widget': 'treeSelect',
      'ui:options': { optionTreeKey: 'regions' },
      'ui:disabled': true,
    },
  });
export const readOnlyTreeSelectFixture = (): TreeSelectFixture =>
  fixtureFor({
    f: {
      'ui:widget': 'treeSelect',
      'ui:options': { optionTreeKey: 'regions' },
      'ui:readonly': true,
    },
  });
export const leavesOnlyTreeSelectFixture = (): TreeSelectFixture =>
  fixtureFor({
    f: {
      'ui:widget': 'treeSelect',
      'ui:options': { optionTreeKey: 'regions', selectableParents: false, defaultExpandAll: true },
    },
  });
