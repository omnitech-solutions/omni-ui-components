import type { Meta, StoryObj } from '@storybook/react';

import { defineFormStories, type FormStoryArgs } from 'storybook-helpers/defineFormStories';
import { expenseScenarioFormFactory, type ExpenseScenarioFormData } from 'factories/omni-ui-components/Form/expenseScenario.factories';

type Args = FormStoryArgs<ExpenseScenarioFormData>;

const config = defineFormStories<ExpenseScenarioFormData>({
  title: 'omni-ui-components/Showcase/NewExpense',
  fixtures: { default: expenseScenarioFormFactory },
  defaultArgs: { fixture: 'default', disabled: false },
  docs: { name: 'NewExpense (Form)', whenToUse: 'Non-interactive hand-composed mirror of the schema-driven NewExpense scenario.' },
  stories: { Default: { fixture: 'default', disabled: false } },
});

const meta: Meta<Args> = {
  title: 'omni-ui-components/Showcase/NewExpense',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;
type Story = StoryObj<Args>;
export const Default: Story = { args: config.stories.Default };
