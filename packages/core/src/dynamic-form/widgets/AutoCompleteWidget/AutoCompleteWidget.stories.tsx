import type { Meta, StoryObj } from '@storybook/react';
import { focusStoryField } from 'factories/dynamic-form/DynamicForm/widgetPlay.factories';
import {
  disabledAutoCompleteFixture,
  plainAutoCompleteFixture,
  readOnlyAutoCompleteFixture,
  requiredAutoCompleteFixture,
} from 'factories/dynamic-form/widgets/AutoCompleteWidget/AutoCompleteWidget.factories';
import { expect, userEvent } from 'storybook/test';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<Record<string, unknown>>;

const config = defineDynamicFormStories<Record<string, unknown>>({
  title: 'dynamic-form/widgets/AutoCompleteWidget',
  fixtures: {
    plain: plainAutoCompleteFixture as never,
    required: requiredAutoCompleteFixture as never,
    disabled: disabledAutoCompleteFixture as never,
    readOnly: readOnlyAutoCompleteFixture as never,
  },
  titles: {
    plain: 'AutoCompleteWidget · plain',
    required: 'AutoCompleteWidget · required',
    disabled: 'AutoCompleteWidget · disabled',
    readOnly: 'AutoCompleteWidget · readOnly',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'AutoCompleteWidget',
    whenToUse:
      'Free text with suggestions: a value outside the list is valid. Suggestions come from the schema `examples`, or from `formContext.optionSets` with `ui:options.optionSetKey`.',
  },
  stories: {
    Plain: { fixture: 'plain' },
    Prefilled: { fixture: 'plain', prefilled: true },
    Required: { fixture: 'required' },
    Disabled: { fixture: 'disabled', prefilled: true },
    ReadOnly: { fixture: 'readOnly', prefilled: true },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/AutoCompleteWidget',
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

/** Driven by the keyboard alone: focus arrives in the field by its key, as a host does it. */
export const Keyboard: Story = {
  args: config.stories.Plain,
  play: async ({ canvasElement }) => {
    const input = focusStoryField(canvasElement) as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.keyboard('Am');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(input).toHaveValue('Amsterdam');
  },
};
