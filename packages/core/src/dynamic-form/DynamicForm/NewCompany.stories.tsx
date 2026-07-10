import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import { companyScenarioFixture, type CompanyScenarioFormData } from 'factories/dynamic-form/DynamicForm/companyScenario.factories';

type Args = DynamicFormStoryArgs<CompanyScenarioFormData>;

const config = defineDynamicFormStories<CompanyScenarioFormData>({
  title: 'dynamic-form/Showcase/NewCompany',
  fixtures: { default: companyScenarioFixture },
  titles: { default: 'New Company' },
  defaultArgs: { fixture: 'default' },
  docs: {
    name: 'NewCompany',
    whenToUse:
      'Mirrors NewContact in reverse: primary contact combobox with a "+ New Contact" sentinel reveals contact fields inline via JSON Schema dependencies.',
  },
  stories: {
    Default: { fixture: 'default', submitLabel: 'Add Company' },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/Showcase/NewCompany',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;
export const Default: Story = { args: config.stories.Default };
