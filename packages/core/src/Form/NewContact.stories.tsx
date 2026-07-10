import type { Meta, StoryObj } from '@storybook/react';

import { defineFormStories, type FormStoryArgs } from 'storybook-helpers/defineFormStories';
import { contactScenarioFormFactory, type ContactScenarioFormData } from 'factories/omni-ui-components/Form/contactScenario.factories';

type Args = FormStoryArgs<ContactScenarioFormData>;

const config = defineFormStories<ContactScenarioFormData>({
  title: 'omni-ui-components/Showcase/NewContact',
  fixtures: { default: contactScenarioFormFactory },
  defaultArgs: { fixture: 'default', disabled: false },
  docs: {
    name: 'NewContact (Form)',
    whenToUse:
      'Non-interactive hand-composed mirror of the schema-driven NewContact scenario. Stories disable interaction so reviewers can compare layout 1:1 with the DynamicForm showcase entry.',
  },
  stories: { Default: { fixture: 'default', disabled: false } },
});

const meta: Meta<Args> = {
  title: 'omni-ui-components/Showcase/NewContact',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;
type Story = StoryObj<Args>;
export const Default: Story = { args: config.stories.Default };
