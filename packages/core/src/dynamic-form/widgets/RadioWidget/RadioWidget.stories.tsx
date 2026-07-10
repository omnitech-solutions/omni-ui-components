import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  descriptionPlanFixture,
  disabledOptionPlanFixture,
  inlinePlanFixture,
  plainPlanFixture,
  prefilledPlanFixture,
  validationPlanFixture,
  type PlanFormData,
} from 'factories/dynamic-form/widgets/RadioWidget/RadioWidget.factories';

type Args = DynamicFormStoryArgs<PlanFormData>;

const config = defineDynamicFormStories<PlanFormData>({
  title: 'dynamic-form/widgets/RadioWidget',
  fixtures: {
    plain: plainPlanFixture,
    inline: inlinePlanFixture,
    description: descriptionPlanFixture,
    prefilled: prefilledPlanFixture,
    validation: validationPlanFixture,
    disabledOption: disabledOptionPlanFixture,
  },
  titles: {
    plain: 'RadioWidget',
    inline: 'RadioWidget · inline',
    description: 'RadioWidget · description',
    prefilled: 'RadioWidget · prefilled',
    validation: 'RadioWidget · required',
    disabledOption: 'RadioWidget · disabled option',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'RadioWidget',
    whenToUse: [
      'Like TextWidget / SelectWidget, never rendered standalone — every story exercises the full',
      'DynamicForm ancestry (Form → ObjectFieldTemplate → FieldTemplate → StringField → RadioWidget →',
      'RadioPrimitive). Options come from `schema.oneOf` / `schema.enum` + `schema.enumNames`.',
      '`ui:options.inline` lays options horizontally; `ui:enumDisabled` greys out specific values.',
    ].join(' '),
  },
  stories: {
    Plain: { fixture: 'plain' },
    Inline: { fixture: 'inline' },
    WithDescription: { fixture: 'description' },
    Prefilled: { fixture: 'prefilled' },
    DisabledOption: { fixture: 'disabledOption' },
    ValidationError: {
      fixture: 'validation',
      submitLabel: 'Try to save (will fail)',
      autoSubmit: true,
    },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/RadioWidget',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;

export const Plain: Story = { args: config.stories.Plain };
export const Inline: Story = { args: config.stories.Inline };
export const WithDescription: Story = { args: config.stories.WithDescription };
export const Prefilled: Story = { args: config.stories.Prefilled };
export const DisabledOption: Story = { args: config.stories.DisabledOption };
export const ValidationError: Story = { args: config.stories.ValidationError };
