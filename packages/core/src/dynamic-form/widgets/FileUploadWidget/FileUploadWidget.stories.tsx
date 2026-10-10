import type { Meta, StoryObj } from '@storybook/react';
import { playKeyboardReach } from 'factories/dynamic-form/DynamicForm/widgetPlay.factories';
import {
  compactFileFixture,
  dataUrlFileFixture,
  imageFileFixture,
  multipleFileFixture,
  nameFileFixture,
  plainFileFixture,
  readOnlyFileFixture,
} from 'factories/dynamic-form/widgets/FileUploadWidget/FileUploadWidget.factories';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<Record<string, unknown>>;

const config = defineDynamicFormStories<Record<string, unknown>>({
  title: 'dynamic-form/widgets/FileUploadWidget',
  fixtures: {
    plain: plainFileFixture as never,
    image: imageFileFixture as never,
    multiple: multipleFileFixture as never,
    compact: compactFileFixture as never,
    dataUrl: dataUrlFileFixture as never,
    name: nameFileFixture as never,
    readOnly: readOnlyFileFixture as never,
  },
  titles: {
    plain: 'FileUploadWidget',
    image: 'FileUploadWidget · image (5MB)',
    multiple: 'FileUploadWidget · multiple',
    compact: 'FileUploadWidget · compact button',
    dataUrl: 'FileUploadWidget · data-url value',
    name: 'FileUploadWidget · name value',
    readOnly: 'FileUploadWidget · read-only',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'FileUploadWidget',
    whenToUse: [
      'One file for a single schema, several for an array. The form holds the real `File` by default and the host uploads it in `onSubmit`: the library never uploads.',
      '`ui:options.mode` is `file`, `data-url` or `name`; `appearance: "button"` draws a compact button; `accept`, `maxSize` (bytes) and `maxFiles` are checked by the control, and a refused file is the field error.',
    ].join(' '),
  },
  stories: {
    Plain: { fixture: 'plain' },
    ImageOnly: { fixture: 'image' },
    Multiple: { fixture: 'multiple' },
    Compact: { fixture: 'compact' },
    DataUrl: { fixture: 'dataUrl' },
    NameOnly: { fixture: 'name' },
    ReadOnly: { fixture: 'readOnly', prefilled: true },
  },
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
export const Compact: Story = { args: config.stories.Compact };
export const DataUrl: Story = { args: config.stories.DataUrl };
export const NameOnly: Story = { args: config.stories.NameOnly };
export const ReadOnly: Story = { args: config.stories.ReadOnly };

/** Reached and left by the keyboard alone (focus arrives by the field's key, as a host does it). */
export const Keyboard: Story = { args: config.stories.Plain, play: playKeyboardReach };
