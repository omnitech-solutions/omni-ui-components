import type { Meta, StoryObj } from '@storybook/react';
import { playKeyboardReach } from 'factories/dynamic-form/DynamicForm/widgetPlay.factories';
import {
  plainMultiSelectFixture,
  prefilledMultiSelectFixture,
  type StackFormData,
  searchableMultiSelectFixture,
} from 'factories/dynamic-form/widgets/MultiSelectWidget/MultiSelectWidget.factories';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<StackFormData>;

const config = defineDynamicFormStories<StackFormData>({
  title: 'dynamic-form/widgets/MultiSelectWidget',
  fixtures: {
    plain: plainMultiSelectFixture,
    searchable: searchableMultiSelectFixture,
    prefilled: prefilledMultiSelectFixture,
  },
  titles: {
    plain: 'MultiSelectWidget',
    searchable: 'MultiSelectWidget · searchable',
    prefilled: 'MultiSelectWidget · prefilled',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'MultiSelectWidget',
    whenToUse:
      'Popover + chip multi-pick for `type: "array"` + `items.oneOf`. Compact alternative to `checkboxes`.',
  },
  stories: {
    Plain: { fixture: 'plain' },
    Searchable: { fixture: 'searchable' },
    Prefilled: { fixture: 'prefilled' },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/MultiSelectWidget',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;
export const Plain: Story = { args: config.stories.Plain };
export const Searchable: Story = { args: config.stories.Searchable };
export const Prefilled: Story = { args: config.stories.Prefilled };

/** Reached and left by the keyboard alone (focus arrives by the field's key, as a host does it). */
export const Keyboard: Story = { args: config.stories.Plain, play: playKeyboardReach };
