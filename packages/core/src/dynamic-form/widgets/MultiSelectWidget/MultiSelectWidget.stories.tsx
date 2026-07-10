import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  plainMultiSelectFixture,
  prefilledMultiSelectFixture,
  searchableMultiSelectFixture,
  type StackFormData,
} from 'factories/dynamic-form/widgets/MultiSelectWidget/MultiSelectWidget.factories';

type Args = DynamicFormStoryArgs<StackFormData>;

const config = defineDynamicFormStories<StackFormData>({
  title: 'dynamic-form/widgets/MultiSelectWidget',
  fixtures: { plain: plainMultiSelectFixture, searchable: searchableMultiSelectFixture, prefilled: prefilledMultiSelectFixture },
  titles: { plain: 'MultiSelectWidget', searchable: 'MultiSelectWidget · searchable', prefilled: 'MultiSelectWidget · prefilled' },
  defaultArgs: { fixture: 'plain' },
  docs: { name: 'MultiSelectWidget', whenToUse: 'Popover + chip multi-pick for `type: "array"` + `items.oneOf`. Compact alternative to `checkboxes`.' },
  stories: { Plain: { fixture: 'plain' }, Searchable: { fixture: 'searchable' }, Prefilled: { fixture: 'prefilled' } },
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
