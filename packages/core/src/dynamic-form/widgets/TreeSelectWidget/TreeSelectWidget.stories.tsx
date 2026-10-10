import type { Meta, StoryObj } from '@storybook/react';
import { focusStoryField } from 'factories/dynamic-form/DynamicForm/widgetPlay.factories';
import {
  disabledTreeSelectFixture,
  leavesOnlyTreeSelectFixture,
  plainTreeSelectFixture,
  readOnlyTreeSelectFixture,
  requiredTreeSelectFixture,
} from 'factories/dynamic-form/widgets/TreeSelectWidget/TreeSelectWidget.factories';
import { expect, userEvent, waitFor } from 'storybook/test';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<Record<string, unknown>>;

const config = defineDynamicFormStories<Record<string, unknown>>({
  title: 'dynamic-form/widgets/TreeSelectWidget',
  fixtures: {
    plain: plainTreeSelectFixture as never,
    required: requiredTreeSelectFixture as never,
    disabled: disabledTreeSelectFixture as never,
    readOnly: readOnlyTreeSelectFixture as never,
    leavesOnly: leavesOnlyTreeSelectFixture as never,
  },
  titles: {
    plain: 'TreeSelectWidget · plain',
    required: 'TreeSelectWidget · required',
    disabled: 'TreeSelectWidget · disabled',
    readOnly: 'TreeSelectWidget · readOnly',
    leavesOnly: 'TreeSelectWidget · leavesOnly',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'TreeSelectWidget',
    whenToUse:
      'A choice from a tree that opens and closes. A string schema stores one node, an array of strings several. The tree is `formContext.optionTrees[ui:options.optionTreeKey]` or `ui:options.tree`.',
  },
  stories: {
    Plain: { fixture: 'plain' },
    Prefilled: { fixture: 'plain', prefilled: true },
    Required: { fixture: 'required' },
    Disabled: { fixture: 'disabled', prefilled: true },
    ReadOnly: { fixture: 'readOnly', prefilled: true },
    LeavesOnly: { fixture: 'leavesOnly' },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/TreeSelectWidget',
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
export const LeavesOnly: Story = { args: config.stories.LeavesOnly };

/** Driven by the keyboard alone: focus arrives in the field by its key, as a host does it. */
export const Keyboard: Story = {
  args: config.stories.Plain,
  play: async ({ canvasElement }) => {
    const trigger = focusStoryField(canvasElement);
    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Home}{Enter}');
    await waitFor(() => expect(trigger).toHaveTextContent('Europe'));
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
