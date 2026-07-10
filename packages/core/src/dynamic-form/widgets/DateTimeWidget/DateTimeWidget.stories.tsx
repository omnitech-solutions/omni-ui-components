import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  plainDateTimeFixture,
  prefilledDateTimeFixture,
  type StartsAtFormData,
} from 'factories/dynamic-form/widgets/DateTimeWidget/DateTimeWidget.factories';

type Args = DynamicFormStoryArgs<StartsAtFormData>;

const config = defineDynamicFormStories<StartsAtFormData>({
  title: 'dynamic-form/widgets/DateTimeWidget',
  fixtures: { plain: plainDateTimeFixture, prefilled: prefilledDateTimeFixture },
  titles: { plain: 'DateTimeWidget', prefilled: 'DateTimeWidget · prefilled' },
  defaultArgs: { fixture: 'plain' },
  docs: { name: 'DateTimeWidget', whenToUse: 'Combined date + time picker for `format: "date-time"`. Submits ISO `YYYY-MM-DDTHH:MM`.' },
  stories: { Plain: { fixture: 'plain' }, Prefilled: { fixture: 'prefilled' } },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/DateTimeWidget',
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
