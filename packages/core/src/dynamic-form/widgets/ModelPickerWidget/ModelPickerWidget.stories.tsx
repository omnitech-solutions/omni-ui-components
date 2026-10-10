import type { Meta, StoryObj } from '@storybook/react';
import { focusStoryField } from 'factories/dynamic-form/DynamicForm/widgetPlay.factories';
import {
  disabledModelPickerFixture,
  plainModelPickerFixture,
  readOnlyModelPickerFixture,
  requiredModelPickerFixture,
} from 'factories/dynamic-form/widgets/ModelPickerWidget/ModelPickerWidget.factories';
import { expect, userEvent, within } from 'storybook/test';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<Record<string, unknown>>;

const config = defineDynamicFormStories<Record<string, unknown>>({
  title: 'dynamic-form/widgets/ModelPickerWidget',
  fixtures: {
    plain: plainModelPickerFixture as never,
    required: requiredModelPickerFixture as never,
    disabled: disabledModelPickerFixture as never,
    readOnly: readOnlyModelPickerFixture as never,
  },
  titles: {
    plain: 'ModelPickerWidget · plain',
    required: 'ModelPickerWidget · required',
    disabled: 'ModelPickerWidget · disabled',
    readOnly: 'ModelPickerWidget · readOnly',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'ModelPickerWidget',
    whenToUse:
      'The chat model menu as a form field; the stored value is the model id. Models come from `formContext.modelSets[ui:options.modelSetKey]`. A read-only field is drawn disabled: the menu has no read-only state.',
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
  title: 'dynamic-form/widgets/ModelPickerWidget',
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
    const trigger = focusStoryField(canvasElement);
    await expect(trigger).toHaveTextContent('Deep');
    await userEvent.keyboard('{Enter}');
    await expect(
      await within(canvasElement.ownerDocument.body).findByText('Quick answers'),
    ).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};
