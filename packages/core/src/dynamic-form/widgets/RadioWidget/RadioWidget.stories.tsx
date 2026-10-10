import type { Meta, StoryObj } from '@storybook/react';
import { playKeyboardArrows } from 'factories/dynamic-form/DynamicForm/widgetPlay.factories';
import {
  cardPlanFixture,
  descriptionPlanFixture,
  disabledOptionPlanFixture,
  inlinePlanFixture,
  type PlanFormData,
  plainPlanFixture,
  prefilledPlanFixture,
  validationPlanFixture,
} from 'factories/dynamic-form/widgets/RadioWidget/RadioWidget.factories';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<PlanFormData>;

const config = defineDynamicFormStories<PlanFormData>({
  title: 'dynamic-form/widgets/RadioWidget',
  fixtures: {
    plain: plainPlanFixture,
    inline: inlinePlanFixture,
    cards: cardPlanFixture,
    description: descriptionPlanFixture,
    prefilled: prefilledPlanFixture,
    validation: validationPlanFixture,
    disabledOption: disabledOptionPlanFixture,
  },
  titles: {
    plain: 'RadioWidget',
    inline: 'RadioWidget · inline',
    cards: 'RadioWidget · selectable cards',
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
    Cards: { fixture: 'cards' },
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
export const Cards: Story = { args: config.stories.Cards };
export const WithDescription: Story = { args: config.stories.WithDescription };
export const Prefilled: Story = { args: config.stories.Prefilled };
export const DisabledOption: Story = { args: config.stories.DisabledOption };
export const ValidationError: Story = { args: config.stories.ValidationError };

/** Driven by the keyboard alone (focus arrives by the field's key, as a host does it). */
export const Keyboard: Story = { args: config.stories.Plain, play: playKeyboardArrows };
