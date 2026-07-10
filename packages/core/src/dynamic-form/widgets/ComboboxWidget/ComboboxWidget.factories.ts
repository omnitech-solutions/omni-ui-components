import { z } from 'zod';
import type { UiSchema, RJSFSchema } from '@rjsf/utils';

import type { DynamicFormFixture, FormFixture } from '../../DynamicForm/DynamicForm.factories';
import { COUNTRY_OPTIONS } from '../../../Select/countries';
import { SHOWCASE_MEMBERS, SHOWCASE_PROJECTS } from '../../../../showcase/entities';
import { selectOptions } from '../../../../helpers/optionMappers';

const COUNTRY_ONE_OF = COUNTRY_OPTIONS.map((opt) => ({ const: opt.value, title: opt.label }));

export interface CountryFormData {
  country: string;
}

const SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['country'],
  properties: { country: { type: 'string', title: 'Country', oneOf: COUNTRY_ONE_OF } },
};

const ZOD = z.object({ country: z.string().min(1, 'Pick a country') }) as unknown as z.ZodType<CountryFormData>;

const fixtureFor = (uiSchema: UiSchema, initial = ''): FormFixture<CountryFormData> => ({
  schema: SCHEMA,
  uiSchema,
  zodSchema: ZOD,
  defaults: { country: initial },
});

export const plainComboboxFixture = (): FormFixture<CountryFormData> => fixtureFor({ country: { 'ui:widget': 'combobox' } });
export const prefilledComboboxFixture = (): FormFixture<CountryFormData> => fixtureFor({ country: { 'ui:widget': 'combobox' } }, 'CA');
export const customPlaceholderComboboxFixture = (): FormFixture<CountryFormData> =>
  fixtureFor({ country: { 'ui:widget': 'combobox', 'ui:placeholder': 'Find a country…' } });

/* -------------------------------------------------------------------------- */
/* New variant fixtures driven through formContext.optionSets.                 */
/* -------------------------------------------------------------------------- */

export interface ProjectFormData {
  project: string;
}
const PROJECT_SCHEMA: RJSFSchema = { type: 'object', properties: { project: { type: 'string', title: 'Project' } } };
const PROJECT_ZOD = z.object({ project: z.string().optional().default('') }) as unknown as z.ZodType<ProjectFormData>;

export const projectComboboxFixture = (): DynamicFormFixture<ProjectFormData, Record<string, string>> => ({
  schema: PROJECT_SCHEMA,
  uiSchema: { project: { 'ui:widget': 'combobox', 'ui:options': { optionSetKey: 'projects', placeholder: 'Add project' } } },
  zodSchema: PROJECT_ZOD,
  defaults: { project: '' },
  derive: () => ({}),
  formContext: {
    optionSets: {
      projects: selectOptions(SHOWCASE_PROJECTS, { value: 'id', label: (p) => `${p.icon} ${p.name}`, description: 'organization', color: 'color' }),
    },
    actions: {},
    locale: 'en-GB',
  },
});

export interface MemberFormData {
  member: string;
}
const MEMBER_SCHEMA: RJSFSchema = { type: 'object', properties: { member: { type: 'string', title: 'Member' } } };
const MEMBER_ZOD = z.object({ member: z.string().optional().default('') }) as unknown as z.ZodType<MemberFormData>;

export const groupedMemberComboboxFixture = (): DynamicFormFixture<MemberFormData, Record<string, string>> => ({
  schema: MEMBER_SCHEMA,
  uiSchema: { member: { 'ui:widget': 'combobox', 'ui:options': { optionSetKey: 'members', placeholder: 'Select…' } } },
  zodSchema: MEMBER_ZOD,
  defaults: { member: '' },
  derive: () => ({}),
  formContext: {
    optionSets: { members: selectOptions(SHOWCASE_MEMBERS, { value: 'id', label: 'name', group: 'group', color: 'color', initials: 'initials' }) },
    actions: {},
    locale: 'en-GB',
  },
});
