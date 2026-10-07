import type { Meta, StoryObj } from '@storybook/react';
import {
  type TimesheetScenarioFormData,
  timesheetScenarioFixture,
} from 'factories/dynamic-form/DynamicForm/timesheetScenario.factories';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<TimesheetScenarioFormData>;

const config = defineDynamicFormStories<TimesheetScenarioFormData>({
  title: 'dynamic-form/Showcase/NewTimesheet',
  fixtures: { default: timesheetScenarioFixture },
  titles: { default: 'New Timesheet' },
  defaultArgs: { fixture: 'default' },
  docs: {
    name: 'NewTimesheet',
    whenToUse:
      'Showcase fixture exercising StaticPanelField (timer header), grouped Member combobox sections, label-action slot ("View Task"), tag chip input, and a billable rate currency field.',
  },
  stories: { Default: { fixture: 'default', submitLabel: 'Add Time' } },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/Showcase/NewTimesheet',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;
type Story = StoryObj<Args>;
export const Default: Story = { args: config.stories.Default };
