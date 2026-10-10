import type { Meta, StoryObj } from '@storybook/react';
import { focusStoryField } from 'factories/dynamic-form/DynamicForm/widgetPlay.factories';
import {
  changeOnSelectCascaderFixture,
  disabledCascaderFixture,
  plainCascaderFixture,
  readOnlyCascaderFixture,
  requiredCascaderFixture,
} from 'factories/dynamic-form/widgets/CascaderWidget/CascaderWidget.factories';
import { expect, userEvent, waitFor } from 'storybook/test';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<Record<string, unknown>>;

const config = defineDynamicFormStories<Record<string, unknown>>({
  title: 'dynamic-form/widgets/CascaderWidget',
  fixtures: {
    plain: plainCascaderFixture as never,
    required: requiredCascaderFixture as never,
    disabled: disabledCascaderFixture as never,
    readOnly: readOnlyCascaderFixture as never,
    changeOnSelect: changeOnSelectCascaderFixture as never,
  },
  titles: {
    plain: 'CascaderWidget · plain',
    required: 'CascaderWidget · required',
    disabled: 'CascaderWidget · disabled',
    readOnly: 'CascaderWidget · readOnly',
    changeOnSelect: 'CascaderWidget · changeOnSelect',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'CascaderWidget',
    whenToUse:
      'A choice made level by level; the stored value is the path, an array of strings. The tree is `formContext.optionTrees[ui:options.optionTreeKey]` or plain data in `ui:options.tree`.',
  },
  stories: {
    Plain: { fixture: 'plain' },
    Prefilled: { fixture: 'plain', prefilled: true },
    Required: { fixture: 'required' },
    Disabled: { fixture: 'disabled', prefilled: true },
    ReadOnly: { fixture: 'readOnly', prefilled: true },
    ChangeOnSelect: { fixture: 'changeOnSelect' },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/CascaderWidget',
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
export const ChangeOnSelect: Story = { args: config.stories.ChangeOnSelect };

/** Driven by the keyboard alone: focus arrives in the field by its key, as a host does it. */
export const Keyboard: Story = {
  args: config.stories.Plain,
  play: async ({ canvasElement }) => {
    const trigger = focusStoryField(canvasElement);
    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Home}{ArrowRight}');
    await userEvent.keyboard('{Home}{Enter}');
    await waitFor(() => expect(trigger).toHaveTextContent('Europe / France'));
  },
};
