import type { Meta, StoryObj } from '@storybook/react';

import { defineFormStories, type FormStoryArgs } from 'storybook-helpers/defineFormStories';
import { timesheetScenarioFormFactory, type TimesheetScenarioFormData } from 'factories/omni-ui-components/Form/timesheetScenario.factories';

type Args = FormStoryArgs<TimesheetScenarioFormData>;

const config = defineFormStories<TimesheetScenarioFormData>({
  title: 'omni-ui-components/Showcase/NewTimesheet',
  fixtures: { default: timesheetScenarioFormFactory },
  defaultArgs: { fixture: 'default', disabled: false },
  docs: { name: 'NewTimesheet (Form)', whenToUse: 'Non-interactive hand-composed mirror of the schema-driven NewTimesheet scenario.' },
  stories: { Default: { fixture: 'default', disabled: false } },
});

const meta: Meta<Args> = {
  title: 'omni-ui-components/Showcase/NewTimesheet',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;
type Story = StoryObj<Args>;
export const Default: Story = { args: config.stories.Default };
