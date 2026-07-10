import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import { imageFileFixture, multipleFileFixture, plainFileFixture } from 'factories/dynamic-form/widgets/FileUploadWidget/FileUploadWidget.factories';

type Args = DynamicFormStoryArgs<Record<string, unknown>>;

const config = defineDynamicFormStories<Record<string, unknown>>({
  title: 'dynamic-form/widgets/FileUploadWidget',
  fixtures: {
    plain: plainFileFixture as never,
    image: imageFileFixture as never,
    multiple: multipleFileFixture as never,
  },
  titles: { plain: 'FileUploadWidget', image: 'FileUploadWidget · image (5MB)', multiple: 'FileUploadWidget · multiple' },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'FileUploadWidget',
    whenToUse: [
      'Drop-zone + click-to-browse for `type: string` (single) or `type: array` (multiple).',
      '`ui:options.accept`, `maxSize` (bytes), `maxFiles` for constraints.',
      'For Active Storage flows, override `onChange` at the DynamicForm level to handle DirectUpload.',
    ].join(' '),
  },
  stories: { Plain: { fixture: 'plain' }, ImageOnly: { fixture: 'image' }, Multiple: { fixture: 'multiple' } },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/FileUploadWidget',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;
export const Plain: Story = { args: config.stories.Plain };
export const ImageOnly: Story = { args: config.stories.ImageOnly };
export const Multiple: Story = { args: config.stories.Multiple };
