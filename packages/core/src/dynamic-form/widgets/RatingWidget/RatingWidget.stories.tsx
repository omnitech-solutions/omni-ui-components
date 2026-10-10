import type { Meta, StoryObj } from '@storybook/react';
import { focusStoryField } from 'factories/dynamic-form/DynamicForm/widgetPlay.factories';
import {
  disabledRatingFixture,
  plainRatingFixture,
  readOnlyRatingFixture,
  requiredRatingFixture,
  smallRatingFixture,
  tenMarksRatingFixture,
} from 'factories/dynamic-form/widgets/RatingWidget/RatingWidget.factories';
import { expect, userEvent, within } from 'storybook/test';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<Record<string, unknown>>;

const config = defineDynamicFormStories<Record<string, unknown>>({
  title: 'dynamic-form/widgets/RatingWidget',
  fixtures: {
    plain: plainRatingFixture as never,
    required: requiredRatingFixture as never,
    disabled: disabledRatingFixture as never,
    readOnly: readOnlyRatingFixture as never,
    tenMarks: tenMarksRatingFixture as never,
    small: smallRatingFixture as never,
  },
  titles: {
    plain: 'RatingWidget · plain',
    required: 'RatingWidget · required',
    disabled: 'RatingWidget · disabled',
    readOnly: 'RatingWidget · readOnly',
    tenMarks: 'RatingWidget · tenMarks',
    small: 'RatingWidget · small',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'RatingWidget',
    whenToUse:
      'A score as marks, stored as an integer. The number of marks is `ui:options.count`, else the schema `maximum`, else 5.',
  },
  stories: {
    Plain: { fixture: 'plain' },
    Prefilled: { fixture: 'plain', prefilled: true },
    Required: { fixture: 'required' },
    Disabled: { fixture: 'disabled', prefilled: true },
    ReadOnly: { fixture: 'readOnly', prefilled: true },
    TenMarks: { fixture: 'tenMarks' },
    Small: { fixture: 'small' },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/RatingWidget',
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
export const Required: Story = { args: config.stories.Required };
export const Disabled: Story = { args: config.stories.Disabled };
export const ReadOnly: Story = { args: config.stories.ReadOnly };
export const TenMarks: Story = { args: config.stories.TenMarks };
export const Small: Story = { args: config.stories.Small };

/** Driven by the keyboard alone: focus arrives in the field by its key, as a host does it. */
export const Keyboard: Story = {
  args: config.stories.Plain,
  play: async ({ canvasElement }) => {
    focusStoryField(canvasElement);
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    const checked = within(canvasElement).getByRole('radio', { checked: true });
    await expect(checked).toHaveFocus();
  },
};
