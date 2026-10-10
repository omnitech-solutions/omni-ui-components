import type { Meta, StoryObj } from '@storybook/react';
import { playKeyboardReach } from 'factories/dynamic-form/DynamicForm/widgetPlay.factories';
import {
  plainToneFixture,
  type ToneFormData,
  twoOptionToneFixture,
  validationToneFixture,
} from 'factories/dynamic-form/widgets/SegmentedWidget/SegmentedWidget.factories';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<ToneFormData>;

const config = defineDynamicFormStories<ToneFormData>({
  title: 'dynamic-form/widgets/SegmentedWidget',
  fixtures: {
    plain: plainToneFixture,
    twoOptions: twoOptionToneFixture,
    validation: validationToneFixture,
  },
  titles: {
    plain: 'SegmentedWidget',
    twoOptions: 'SegmentedWidget · two options',
    validation: 'SegmentedWidget · required',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'SegmentedWidget',
    whenToUse: [
      'Single-select pill row for 2–4 short choices. Same data contract as `radio` / `select`.',
      'Use when choices read naturally side-by-side (tone, plan tier, yes/no toggles).',
      'For longer lists prefer `radio` (stacked) or `select` (combobox).',
    ].join(' '),
  },
  stories: {
    Plain: { fixture: 'plain' },
    TwoOptions: { fixture: 'twoOptions' },
    ValidationError: {
      fixture: 'validation',
      submitLabel: 'Try to save (will fail)',
      autoSubmit: true,
    },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/SegmentedWidget',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;

export const Plain: Story = { args: config.stories.Plain };
export const TwoOptions: Story = { args: config.stories.TwoOptions };
export const ValidationError: Story = { args: config.stories.ValidationError };

/** Reached and left by the keyboard alone (focus arrives by the field's key, as a host does it). */
export const Keyboard: Story = { args: config.stories.Plain, play: playKeyboardReach };
