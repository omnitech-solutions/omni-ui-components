import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  disabledDateFixture,
  plainDateFixture,
  prefilledDateFixture,
  type DueDateFormData,
} from 'factories/dynamic-form/widgets/DateWidget/DateWidget.factories';

type Args = DynamicFormStoryArgs<DueDateFormData>;

const config = defineDynamicFormStories<DueDateFormData>({
  title: 'dynamic-form/widgets/DateWidget',
  fixtures: { plain: plainDateFixture, prefilled: prefilledDateFixture, disabled: disabledDateFixture },
  titles: { plain: 'DateWidget', prefilled: 'DateWidget · prefilled', disabled: 'DateWidget · disabled' },
  defaultArgs: { fixture: 'plain' },
  docs: { name: 'DateWidget', whenToUse: 'Popover + Calendar for `type: "string", format: "date"`. Submits YYYY-MM-DD.' },
  stories: { Plain: { fixture: 'plain' }, Prefilled: { fixture: 'prefilled' }, Disabled: { fixture: 'disabled' } },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/DateWidget',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;
export const Plain: Story = { args: config.stories.Plain };
export const Prefilled: Story = { args: config.stories.Prefilled };
export const Disabled: Story = { args: config.stories.Disabled };
