import type { Meta, StoryObj } from '@storybook/react';
import { playKeyboardReach } from 'factories/dynamic-form/DynamicForm/widgetPlay.factories';
import {
  boundedDateTimeFixture,
  instantDateTimeFixture,
  plainDateTimeFixture,
  prefilledDateTimeFixture,
  readOnlyDateTimeFixture,
  type StartsAtFormData,
} from 'factories/dynamic-form/widgets/DateTimeWidget/DateTimeWidget.factories';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<StartsAtFormData>;

const config = defineDynamicFormStories<StartsAtFormData>({
  title: 'dynamic-form/widgets/DateTimeWidget',
  fixtures: {
    plain: plainDateTimeFixture,
    prefilled: prefilledDateTimeFixture,
    instant: instantDateTimeFixture,
    bounded: boundedDateTimeFixture,
    readOnly: readOnlyDateTimeFixture,
  },
  titles: {
    plain: 'DateTimeWidget',
    prefilled: 'DateTimeWidget · prefilled',
    instant: 'DateTimeWidget · stored as an instant',
    bounded: 'DateTimeWidget · min and max',
    readOnly: 'DateTimeWidget · read-only',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'DateTimeWidget',
    whenToUse:
      'A day and a time for `format: "date-time"`. Stores a local `YYYY-MM-DDTHH:MM`, or an ISO instant in UTC with `ui:options.storage: "instant"`; clearing stores nothing. `ui:options.min` and `max` bound the calendar.',
  },
  stories: {
    Plain: { fixture: 'plain' },
    Prefilled: { fixture: 'prefilled' },
    Instant: { fixture: 'instant', prefilled: true },
    Bounded: { fixture: 'bounded', prefilled: true },
    ReadOnly: { fixture: 'readOnly', prefilled: true },
  },
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
export const Instant: Story = { args: config.stories.Instant };
export const Bounded: Story = { args: config.stories.Bounded };
export const ReadOnly: Story = { args: config.stories.ReadOnly };

/** Reached and left by the keyboard alone (focus arrives by the field's key, as a host does it). */
export const Keyboard: Story = { args: config.stories.Plain, play: playKeyboardReach };
