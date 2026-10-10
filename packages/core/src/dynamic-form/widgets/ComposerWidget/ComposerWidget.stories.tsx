import type { Meta, StoryObj } from '@storybook/react';
import { focusStoryField } from 'factories/dynamic-form/DynamicForm/widgetPlay.factories';
import {
  disabledComposerFixture,
  pillComposerFixture,
  plainComposerFixture,
  readOnlyComposerFixture,
  requiredComposerFixture,
} from 'factories/dynamic-form/widgets/ComposerWidget/ComposerWidget.factories';
import { expect, userEvent } from 'storybook/test';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<Record<string, unknown>>;

const config = defineDynamicFormStories<Record<string, unknown>>({
  title: 'dynamic-form/widgets/ComposerWidget',
  fixtures: {
    plain: plainComposerFixture as never,
    required: requiredComposerFixture as never,
    disabled: disabledComposerFixture as never,
    readOnly: readOnlyComposerFixture as never,
    pill: pillComposerFixture as never,
  },
  titles: {
    plain: 'ComposerWidget · plain',
    required: 'ComposerWidget · required',
    disabled: 'ComposerWidget · disabled',
    readOnly: 'ComposerWidget · readOnly',
    pill: 'ComposerWidget · pill',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'ComposerWidget',
    whenToUse:
      'The chat message box as a form field; the stored value is the draft text. The form submits it, so no send control is drawn.',
  },
  stories: {
    Plain: { fixture: 'plain' },
    Prefilled: { fixture: 'plain', prefilled: true },
    Required: { fixture: 'required' },
    Disabled: { fixture: 'disabled', prefilled: true },
    ReadOnly: { fixture: 'readOnly', prefilled: true },
    Pill: { fixture: 'pill' },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/ComposerWidget',
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
export const Required: Story = { args: config.stories.Required };
export const Disabled: Story = { args: config.stories.Disabled };
export const ReadOnly: Story = { args: config.stories.ReadOnly };
export const Pill: Story = { args: config.stories.Pill };

/** Driven by the keyboard alone: focus arrives in the field by its key, as a host does it. */
export const Keyboard: Story = {
  args: config.stories.Plain,
  play: async ({ canvasElement }) => {
    const box = focusStoryField(canvasElement) as HTMLTextAreaElement;
    await userEvent.clear(box);
    await userEvent.keyboard('Hello{Enter}there');
    await expect(box.value).toBe('Hello\nthere');
  },
};
