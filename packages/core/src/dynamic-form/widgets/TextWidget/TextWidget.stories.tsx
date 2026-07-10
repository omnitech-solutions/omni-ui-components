import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  commitOnEnterSubjectFixture,
  descriptionSubjectFixture,
  placeholderSubjectFixture,
  plainSubjectFixture,
  prefilledSubjectFixture,
  validationSubjectFixture,
  type SubjectFormData,
} from 'factories/dynamic-form/widgets/TextWidget/TextWidget.factories';

type Args = DynamicFormStoryArgs<SubjectFormData>;

const config = defineDynamicFormStories<SubjectFormData>({
  title: 'dynamic-form/widgets/TextWidget',
  fixtures: {
    plain: plainSubjectFixture,
    placeholder: placeholderSubjectFixture,
    description: descriptionSubjectFixture,
    commitOnEnter: commitOnEnterSubjectFixture,
    prefilled: prefilledSubjectFixture,
    validation: validationSubjectFixture,
  },
  titles: {
    plain: 'TextWidget',
    placeholder: 'TextWidget · placeholder',
    description: 'TextWidget · description',
    commitOnEnter: 'TextWidget · commitOnEnter',
    prefilled: 'TextWidget · prefilled',
    validation: 'TextWidget · required',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'TextWidget',
    whenToUse: [
      'The TextWidget is **never** rendered standalone — every story runs the widget through DynamicForm so',
      'the full wrapper ancestry (Form → ObjectFieldTemplate → FieldTemplate → StringField → TextWidget →',
      'Input) is exercised. ui:options drive the variants below.',
    ].join(' '),
  },
  stories: {
    Plain: { fixture: 'plain' },
    WithPlaceholder: { fixture: 'placeholder' },
    WithDescription: { fixture: 'description' },
    CommitOnEnter: { fixture: 'commitOnEnter' },
    Prefilled: { fixture: 'prefilled' },
    ValidationError: {
      fixture: 'validation',
      submitLabel: 'Try to save (will fail)',
      autoSubmit: true,
    },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/TextWidget',
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
export const CommitOnEnter: Story = { args: config.stories.CommitOnEnter };
export const Prefilled: Story = { args: config.stories.Prefilled };
export const ValidationError: Story = { args: config.stories.ValidationError };
