import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  descriptionMessageFixture,
  placeholderMessageFixture,
  plainMessageFixture,
  prefilledMessageFixture,
  tallMessageFixture,
  validationMessageFixture,
  type MessageFormData,
} from 'factories/dynamic-form/widgets/TextareaWidget/TextareaWidget.factories';

type Args = DynamicFormStoryArgs<MessageFormData>;

const config = defineDynamicFormStories<MessageFormData>({
  title: 'dynamic-form/widgets/TextareaWidget',
  fixtures: {
    plain: plainMessageFixture,
    placeholder: placeholderMessageFixture,
    description: descriptionMessageFixture,
    tall: tallMessageFixture,
    prefilled: prefilledMessageFixture,
    validation: validationMessageFixture,
  },
  titles: {
    plain: 'TextareaWidget',
    placeholder: 'TextareaWidget · placeholder',
    description: 'TextareaWidget · description',
    tall: 'TextareaWidget · 10 rows',
    prefilled: 'TextareaWidget · prefilled',
    validation: 'TextareaWidget · required',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'TextareaWidget',
    whenToUse: [
      'Like TextWidget, never rendered standalone — every story exercises the full DynamicForm ancestry',
      '(Form → ObjectFieldTemplate → FieldTemplate → StringField → TextareaWidget → Textarea). Drive rows',
      'and emptyValue through ui:options. Matches the @rjsf/shadcn TextareaWidget contract.',
    ].join(' '),
  },
  stories: {
    Plain: { fixture: 'plain' },
    WithPlaceholder: { fixture: 'placeholder' },
    WithDescription: { fixture: 'description' },
    Tall: { fixture: 'tall' },
    Prefilled: { fixture: 'prefilled' },
    ValidationError: {
      fixture: 'validation',
      submitLabel: 'Try to save (will fail)',
      autoSubmit: true,
    },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/TextareaWidget',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;

export const Plain: Story = { args: config.stories.Plain };
export const WithPlaceholder: Story = { args: config.stories.WithPlaceholder };
export const WithDescription: Story = { args: config.stories.WithDescription };
export const Tall: Story = { args: config.stories.Tall };
export const Prefilled: Story = { args: config.stories.Prefilled };
export const ValidationError: Story = { args: config.stories.ValidationError };
