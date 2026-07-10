import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  plainTosFixture,
  prefilledTosFixture,
  validationTosFixture,
  type TosFormData,
} from 'factories/dynamic-form/widgets/CheckboxWidget/CheckboxWidget.factories';

type Args = DynamicFormStoryArgs<TosFormData>;

const config = defineDynamicFormStories<TosFormData>({
  title: 'dynamic-form/widgets/CheckboxWidget',
  fixtures: {
    plain: plainTosFixture,
    prefilled: prefilledTosFixture,
    validation: validationTosFixture,
  },
  titles: {
    plain: 'CheckboxWidget',
    prefilled: 'CheckboxWidget · prefilled',
    validation: 'CheckboxWidget · required',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'CheckboxWidget',
    whenToUse: [
      'Boolean checkbox; never standalone — every story exercises the full DynamicForm ancestry',
      '(Form → ObjectFieldTemplate → FieldTemplate → BooleanField → CheckboxWidget → CheckboxPrimitive).',
      'Use `ui:options.label=false` or `ui:title` to override the inline label.',
    ].join(' '),
  },
  stories: {
    Plain: { fixture: 'plain' },
    Prefilled: { fixture: 'prefilled' },
    ValidationError: {
      fixture: 'validation',
      submitLabel: 'Try to save (will fail)',
      autoSubmit: true,
    },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/CheckboxWidget',
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
export const ValidationError: Story = { args: config.stories.ValidationError };
