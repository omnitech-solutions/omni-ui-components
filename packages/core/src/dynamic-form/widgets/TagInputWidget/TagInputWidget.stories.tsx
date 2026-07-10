import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  maxTagsFixture,
  plainTagsFixture,
  prefilledTagsFixture,
  type TagsFormData,
} from 'factories/dynamic-form/widgets/TagInputWidget/TagInputWidget.factories';

type Args = DynamicFormStoryArgs<TagsFormData>;

const config = defineDynamicFormStories<TagsFormData>({
  title: 'dynamic-form/widgets/TagInputWidget',
  fixtures: { plain: plainTagsFixture, prefilled: prefilledTagsFixture, max: maxTagsFixture },
  titles: { plain: 'TagInputWidget', prefilled: 'TagInputWidget · prefilled', max: 'TagInputWidget · maxItems' },
  defaultArgs: { fixture: 'plain' },
  docs: { name: 'TagInputWidget', whenToUse: 'Chip-based string-array input. Enter / comma adds a chip; Backspace removes last; X removes specific.' },
  stories: { Plain: { fixture: 'plain' }, Prefilled: { fixture: 'prefilled' }, MaxItems: { fixture: 'max' } },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/TagInputWidget',
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
export const MaxItems: Story = { args: config.stories.MaxItems };
