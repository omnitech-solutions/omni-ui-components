import type { DynamicFormFixture } from './DynamicForm.factories';
import type { OmniSelectOption } from '../../../../dynamic-form/lib/formContext';
import { NEW_CONTACT_OPTION, SHOWCASE_CONTACTS } from '../../../showcase/entities';
import { selectOptions } from '../../../helpers/optionMappers';
import { companyScenarioInitial, companyScenarioZod, type CompanyScenarioFormData } from '../../Form/companyScenario.factories';

export type { CompanyScenarioFormData };
export { NEW_CONTACT_OPTION };
export type CompanyScenarioDerived = Record<string, string>;

const CONTACT_OPTIONS: OmniSelectOption[] = [
  { value: NEW_CONTACT_OPTION, label: '+ New Contact', description: null, initials: '+', color: null, avatarUrl: null, group: null, disabled: false },
  ...selectOptions(SHOWCASE_CONTACTS, { value: 'id', label: 'name', description: 'email', initials: 'initials', avatarUrl: 'avatarUrl' }),
];

export const companyScenarioFixture = (): DynamicFormFixture<CompanyScenarioFormData, CompanyScenarioDerived> => ({
  schema: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', title: 'Company Name' },
      connectionDomainValue: { type: 'string', title: 'Domain' },
      primaryContactId: { type: 'string', title: 'Primary Contact' },
      primaryContactName: { type: 'string', title: 'Name' },
      primaryContactEmail: { type: 'string', title: 'Email', format: 'email' },
      primaryContactPhoneNumber: { type: 'string', title: 'Phone Number' },
      primaryContactRole: { type: 'string', title: 'Job Title' },
      /* Hidden API parity fields */
      avatarUrl: { type: 'string', title: 'Avatar URL' },
      description: { type: 'string', title: 'Description' },
      linkedin: { type: 'string', title: 'LinkedIn' },
      instagram: { type: 'string', title: 'Instagram' },
      twitter: { type: 'string', title: 'Twitter' },
      facebook: { type: 'string', title: 'Facebook' },
      industry: { type: 'string', title: 'Industry' },
      companySize: { type: 'string', title: 'Company Size' },
      source: { type: 'string', title: 'Source' },
    },
    dependencies: {
      primaryContactId: {
        oneOf: [
          { properties: { primaryContactId: { type: 'string', enum: [NEW_CONTACT_OPTION] } }, required: ['primaryContactName', 'primaryContactEmail'] },
          { properties: { primaryContactId: { type: 'string', not: { enum: [NEW_CONTACT_OPTION] } } } },
        ],
      },
    },
  },
  uiSchema: {
    'ui:rows': [
      ['name'],
      ['connectionDomainValue'],
      ['primaryContactId'],
      ['primaryContactName'],
      ['primaryContactEmail'],
      ['primaryContactPhoneNumber'],
      ['primaryContactRole'],
    ],
    name: { 'ui:widget': 'text', 'ui:placeholder': 'Acme Inc.' },
    connectionDomainValue: { 'ui:widget': 'text', 'ui:placeholder': 'acme.com' },
    primaryContactId: { 'ui:widget': 'combobox', 'ui:options': { optionSetKey: 'contacts', placeholder: 'Select or create a contact…' } },
    primaryContactName: { 'ui:widget': 'text', 'ui:placeholder': 'Contact Name' },
    primaryContactEmail: { 'ui:widget': 'text', 'ui:placeholder': 'Email' },
    primaryContactPhoneNumber: { 'ui:widget': 'phone', 'ui:placeholder': '(123) 456-7890' },
    primaryContactRole: { 'ui:widget': 'text', 'ui:placeholder': 'Manager' },
    /* Hidden API parity */
    avatarUrl: { 'ui:widget': 'hidden' },
    description: { 'ui:widget': 'hidden' },
    linkedin: { 'ui:widget': 'hidden' },
    instagram: { 'ui:widget': 'hidden' },
    twitter: { 'ui:widget': 'hidden' },
    facebook: { 'ui:widget': 'hidden' },
    industry: { 'ui:widget': 'hidden' },
    companySize: { 'ui:widget': 'hidden' },
    source: { 'ui:widget': 'hidden' },
  },
  zodSchema: companyScenarioZod,
  defaults: { ...companyScenarioInitial },
  derive: () => ({}),
  formContext: { optionSets: { contacts: CONTACT_OPTIONS }, actions: {}, locale: 'en-GB' },
});
