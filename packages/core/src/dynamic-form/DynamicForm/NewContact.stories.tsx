import type { Meta, StoryObj } from '@storybook/react';
import {
  type ContactScenarioFormData,
  contactScenarioFixture,
} from 'factories/dynamic-form/DynamicForm/contactScenario.factories';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<ContactScenarioFormData>;

const config = defineDynamicFormStories<ContactScenarioFormData>({
  title: 'dynamic-form/Showcase/NewContact',
  fixtures: { default: contactScenarioFixture },
  titles: { default: 'New Contact' },
  defaultArgs: { fixture: 'default' },
  docs: {
    name: 'NewContact',
    whenToUse: [
      'Showcase fixture that rebuilds the production New Contact modal as JSON schema + uiSchema + Zod.',
      'Demonstrates: company combobox with a "+ New Company" create row sourced from formContext.optionSets,',
      'inline reveal of Company Name / Domain / Job Title via JSON Schema dependencies, and Zod superRefine',
      'enforcement of the conditional companyName field.',
    ].join(' '),
  },
  stories: {
    Default: { fixture: 'default', submitLabel: 'Create Contact' },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/Showcase/NewContact',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;
export const Default: Story = { args: config.stories.Default };
