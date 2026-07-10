import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import { expenseScenarioFixture, type ExpenseScenarioFormData } from 'factories/dynamic-form/DynamicForm/expenseScenario.factories';

type Args = DynamicFormStoryArgs<ExpenseScenarioFormData>;

const config = defineDynamicFormStories<ExpenseScenarioFormData>({
  title: 'dynamic-form/Showcase/NewExpense',
  fixtures: { default: expenseScenarioFixture },
  titles: { default: 'New Expense' },
  defaultArgs: { fixture: 'default' },
  docs: {
    name: 'NewExpense',
    whenToUse: [
      'Full-scenario showcase: grouped category dropdown, tax dropdown with "Manage Tax Rates" footer action,',
      'collapsible "Additional Fields" object, derived Excluding-Tax + Sales-Price labels driven by',
      'formContext.derived, recurring toggle, date picker, and a project/member combobox pair sourced from',
      'formContext.optionSets. No new primitives beyond what previous PRs added — pure composition.',
    ].join(' '),
  },
  stories: { Default: { fixture: 'default', submitLabel: 'Create Expense' } },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/Showcase/NewExpense',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;
export const Default: Story = { args: config.stories.Default };
