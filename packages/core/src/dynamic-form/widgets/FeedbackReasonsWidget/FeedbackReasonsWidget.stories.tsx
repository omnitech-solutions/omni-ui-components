import type { Meta, StoryObj } from '@storybook/react';
import {
  focusStoryField,
  storyField,
} from 'factories/dynamic-form/DynamicForm/widgetPlay.factories';
import {
  disabledFeedbackReasonsFixture,
  type FeedbackReasonsFormData,
  plainFeedbackReasonsFixture,
  readOnlyFeedbackReasonsFixture,
  requiredFeedbackReasonsFixture,
} from 'factories/dynamic-form/widgets/FeedbackReasonsWidget/FeedbackReasonsWidget.factories';
import { expect, userEvent, within } from 'storybook/test';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<FeedbackReasonsFormData>;

const config = defineDynamicFormStories<FeedbackReasonsFormData>({
  title: 'dynamic-form/widgets/FeedbackReasonsWidget',
  fixtures: {
    plain: plainFeedbackReasonsFixture,
    required: requiredFeedbackReasonsFixture,
    disabled: disabledFeedbackReasonsFixture,
    readOnly: readOnlyFeedbackReasonsFixture,
  },
  titles: {
    plain: 'FeedbackReasonsWidget',
    required: 'FeedbackReasonsWidget · required',
    disabled: 'FeedbackReasonsWidget · disabled',
    readOnly: 'FeedbackReasonsWidget · read-only',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'FeedbackReasonsWidget',
    whenToUse:
      'The chat feedback panel reason chips as a form field; the stored value is the chosen reason ids. Same schema as `checkboxes`. The panel note box and its own submit are not drawn: the form submits, and a note is its own `textarea` field.',
  },
  stories: {
    Plain: { fixture: 'plain' },
    Required: { fixture: 'required' },
    Disabled: { fixture: 'disabled' },
    ReadOnly: { fixture: 'readOnly' },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/FeedbackReasonsWidget',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;
export const Plain: Story = { args: config.stories.Plain };
export const Required: Story = { args: config.stories.Required };
export const Disabled: Story = { args: config.stories.Disabled };
export const ReadOnly: Story = { args: config.stories.ReadOnly };

/** By keyboard: focus arrives by the field key on the first chip; Space turns it on. */
export const Keyboard: Story = {
  args: config.stories.Plain,
  play: async ({ canvasElement }) => {
    const chip = focusStoryField(canvasElement);
    const before = chip.getAttribute('aria-pressed');
    await userEvent.keyboard(' ');
    await expect(chip).not.toHaveAttribute('aria-pressed', before ?? '');
    await expect(within(storyField(canvasElement)).getAllByRole('button').length).toBe(3);
  },
};
