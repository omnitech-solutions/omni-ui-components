import type { Meta, StoryObj } from '@storybook/react';
import { focusStoryField } from 'factories/dynamic-form/DynamicForm/widgetPlay.factories';
import {
  disabledMentionsFixture,
  hashTriggerMentionsFixture,
  plainMentionsFixture,
  readOnlyMentionsFixture,
  requiredMentionsFixture,
} from 'factories/dynamic-form/widgets/MentionsWidget/MentionsWidget.factories';
import { expect, userEvent } from 'storybook/test';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<Record<string, unknown>>;

const config = defineDynamicFormStories<Record<string, unknown>>({
  title: 'dynamic-form/widgets/MentionsWidget',
  fixtures: {
    plain: plainMentionsFixture as never,
    required: requiredMentionsFixture as never,
    disabled: disabledMentionsFixture as never,
    readOnly: readOnlyMentionsFixture as never,
    hashTrigger: hashTriggerMentionsFixture as never,
  },
  titles: {
    plain: 'MentionsWidget · plain',
    required: 'MentionsWidget · required',
    disabled: 'MentionsWidget · disabled',
    readOnly: 'MentionsWidget · readOnly',
    hashTrigger: 'MentionsWidget · hashTrigger',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'MentionsWidget',
    whenToUse:
      'Several lines of text in which a trigger character offers names from `formContext.optionSets`. The stored value is the plain text.',
  },
  stories: {
    Plain: { fixture: 'plain' },
    Prefilled: { fixture: 'plain', prefilled: true },
    Required: { fixture: 'required' },
    Disabled: { fixture: 'disabled', prefilled: true },
    ReadOnly: { fixture: 'readOnly', prefilled: true },
    HashTrigger: { fixture: 'hashTrigger' },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/MentionsWidget',
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
export const HashTrigger: Story = { args: config.stories.HashTrigger };

/** Driven by the keyboard alone: focus arrives in the field by its key, as a host does it. */
export const Keyboard: Story = {
  args: config.stories.Plain,
  play: async ({ canvasElement }) => {
    const box = focusStoryField(canvasElement) as HTMLTextAreaElement;
    await userEvent.clear(box);
    await userEvent.type(box, 'Hi @ja');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(box.value).toContain('@jamie ');
  },
};
