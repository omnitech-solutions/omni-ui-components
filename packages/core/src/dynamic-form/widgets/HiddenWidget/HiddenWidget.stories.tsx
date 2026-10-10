import type { Meta, StoryObj } from '@storybook/react';
import {
  hiddenRecordFixture,
  type RecordFormData,
} from 'factories/dynamic-form/widgets/HiddenWidget/HiddenWidget.factories';
import { expect, userEvent, within } from 'storybook/test';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<RecordFormData>;

const config = defineDynamicFormStories<RecordFormData>({
  title: 'dynamic-form/widgets/HiddenWidget',
  fixtures: { record: hiddenRecordFixture },
  titles: { record: 'HiddenWidget' },
  defaultArgs: { fixture: 'record', prefilled: true },
  docs: {
    name: 'HiddenWidget',
    whenToUse:
      'Draws nothing visible and keeps its value in the form data: for ids, tokens and computed fields. Chosen with `ui:widget: "hidden"`.',
  },
  stories: { Default: { fixture: 'record', prefilled: true } },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/HiddenWidget',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;

/** Nothing is drawn: the value travels with the form as a hidden input. */
export const Default: Story = { args: config.stories.Default };

/** The hidden value is not a tab stop: Tab from the start lands on the visible field, and the value is still held. */
export const Keyboard: Story = {
  args: config.stories.Default,
  play: async ({ canvasElement }) => {
    const hidden = canvasElement.querySelector('[data-slot="hidden-widget"]');
    await expect(hidden).toHaveValue('rec_42');
    const note = within(canvasElement).getByLabelText('Note');
    note.focus();
    await userEvent.keyboard('kept');
    await expect(note).toHaveValue('kept');
    await expect(hidden).toHaveValue('rec_42');
  },
};
