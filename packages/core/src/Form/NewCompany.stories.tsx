import type { Meta, StoryObj } from '@storybook/react';

import { defineFormStories, type FormStoryArgs } from 'storybook-helpers/defineFormStories';
import { companyScenarioFormFactory, type CompanyScenarioFormData } from 'factories/omni-ui-components/Form/companyScenario.factories';

type Args = FormStoryArgs<CompanyScenarioFormData>;

const config = defineFormStories<CompanyScenarioFormData>({
  title: 'omni-ui-components/Showcase/NewCompany',
  fixtures: { default: companyScenarioFormFactory },
  defaultArgs: { fixture: 'default', disabled: false },
  docs: { name: 'NewCompany (Form)', whenToUse: 'Non-interactive hand-composed mirror of the NewCompany DynamicForm scenario.' },
  stories: { Default: { fixture: 'default', disabled: false } },
});

const meta: Meta<Args> = {
  title: 'omni-ui-components/Showcase/NewCompany',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;
type Story = StoryObj<Args>;
export const Default: Story = { args: config.stories.Default };
