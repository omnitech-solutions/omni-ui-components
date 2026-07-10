import type { DynamicFormFixture } from './DynamicForm.factories';
import type { OmniSelectOption } from '../../../../dynamic-form/lib/formContext';
import { NEW_COMPANY_OPTION, SHOWCASE_COMPANIES } from '../../../showcase/entities';
import { selectOptions } from '../../../helpers/optionMappers';
import { contactScenarioInitial, contactScenarioZod, type ContactScenarioFormData } from '../../Form/contactScenario.factories';

export type { ContactScenarioFormData };
export { NEW_COMPANY_OPTION };
export type ContactScenarioDerived = Record<string, string>;

const COMPANY_OPTIONS: OmniSelectOption[] = [
  { value: NEW_COMPANY_OPTION, label: '+ New Company', description: null, initials: '+', color: null, avatarUrl: null, group: null, disabled: false },
  ...selectOptions(SHOWCASE_COMPANIES, { value: 'id', label: 'name', initials: 'initials', color: 'color', avatarUrl: 'avatarUrl' }),
];

export const contactScenarioFixture = (): DynamicFormFixture<ContactScenarioFormData, ContactScenarioDerived> => ({
  schema: {
    type: 'object',
    required: ['name', 'email', 'connectionId'],
    properties: {
      name: { type: 'string', title: 'Name' },
      email: { type: 'string', title: 'Email', format: 'email' },
      phoneNumber: { type: 'string', title: 'Phone' },
      connectionId: { type: 'string', title: 'Company' },
      connectionName: { type: 'string', title: 'Company Name' },
      connectionDomainValue: { type: 'string', title: 'Domain' },
      role: { type: 'string', title: 'Job Title' },
      notes: { type: 'string', title: 'Notes' },
      avatarUrl: { type: 'string', title: 'Avatar URL' },
    },
    dependencies: {
      connectionId: {
        oneOf: [
          { properties: { connectionId: { type: 'string', enum: [NEW_COMPANY_OPTION] } }, required: ['connectionName'] },
          { properties: { connectionId: { type: 'string', not: { enum: [NEW_COMPANY_OPTION] } } } },
        ],
      },
    },
  },
  uiSchema: {
    'ui:rows': [['name'], ['email'], ['phoneNumber'], ['connectionId'], ['connectionName'], ['connectionDomainValue'], ['role']],
    name: { 'ui:widget': 'text', 'ui:placeholder': 'Name' },
    email: { 'ui:widget': 'text', 'ui:placeholder': 'Email' },
    phoneNumber: { 'ui:widget': 'phone', 'ui:placeholder': '(123) 456-7890' },
    connectionId: { 'ui:widget': 'combobox', 'ui:options': { optionSetKey: 'companies', placeholder: 'Select or create a company…' } },
    connectionName: { 'ui:widget': 'text', 'ui:placeholder': 'Company name' },
    connectionDomainValue: { 'ui:widget': 'text', 'ui:placeholder': 'acme.com' },
    role: { 'ui:widget': 'text', 'ui:placeholder': 'Manager' },
    /* Hidden — backend accepts but the modal does not render them. */
    notes: { 'ui:widget': 'hidden' },
    avatarUrl: { 'ui:widget': 'hidden' },
  },
  zodSchema: contactScenarioZod,
  defaults: { ...contactScenarioInitial },
  derive: () => ({}),
  formContext: { optionSets: { companies: COMPANY_OPTIONS }, actions: {}, locale: 'en-GB' },
});
