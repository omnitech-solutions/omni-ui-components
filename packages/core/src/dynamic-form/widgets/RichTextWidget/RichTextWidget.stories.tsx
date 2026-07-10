import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import { plainRichTextFixture, prefilledRichTextFixture, type DescFormData } from 'factories/dynamic-form/widgets/RichTextWidget/RichTextWidget.factories';

type Args = DynamicFormStoryArgs<DescFormData>;

const config = defineDynamicFormStories<DescFormData>({
  title: 'dynamic-form/widgets/RichTextWidget',
  fixtures: { plain: plainRichTextFixture, prefilled: prefilledRichTextFixture },
  titles: { plain: 'RichTextWidget', prefilled: 'RichTextWidget · prefilled' },
  defaultArgs: { fixture: 'plain' },
  docs: { name: 'RichTextWidget', whenToUse: 'TipTap 3-powered HTML editor. Submits an HTML string.' },
  stories: { Plain: { fixture: 'plain' }, Prefilled: { fixture: 'prefilled' } },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/RichTextWidget',
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
