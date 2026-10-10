import type { Meta, StoryObj } from '@storybook/react';
import { focusStoryField } from 'factories/dynamic-form/DynamicForm/widgetPlay.factories';
import {
  boundedPeriodFixture,
  disabledPeriodFixture,
  type PeriodFormData,
  plainPeriodFixture,
  readOnlyPeriodFixture,
  requiredPeriodFixture,
} from 'factories/dynamic-form/fields/DateRangeField/DateRangeField.factories';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<PeriodFormData>;

const config = defineDynamicFormStories<PeriodFormData>({
  title: 'dynamic-form/fields/DateRangeField',
  fixtures: {
    plain: plainPeriodFixture,
    required: requiredPeriodFixture,
    bounded: boundedPeriodFixture,
    disabled: disabledPeriodFixture,
    readOnly: readOnlyPeriodFixture,
  },
  titles: {
    plain: 'DateRangeField',
    required: 'DateRangeField · required',
    bounded: 'DateRangeField · min, max and placeholder',
    disabled: 'DateRangeField · disabled',
    readOnly: 'DateRangeField · read-only',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'DateRangeField',
    whenToUse:
      'A first and a last day in one control. It is a field (`ui:field: "dateRange"`), not a widget, because its value is an object: `{ from, to }`, each `YYYY-MM-DD`. `ui:options.min`, `max`, `placeholder`.',
  },
  stories: {
    Plain: { fixture: 'plain' },
    Required: { fixture: 'required' },
    Bounded: { fixture: 'bounded' },
    Disabled: { fixture: 'disabled' },
    ReadOnly: { fixture: 'readOnly' },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/fields/DateRangeField',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;
export const Plain: Story = { args: config.stories.Plain };
export const Required: Story = { args: config.stories.Required };
export const Bounded: Story = { args: config.stories.Bounded };
export const Disabled: Story = { args: config.stories.Disabled };
export const ReadOnly: Story = { args: config.stories.ReadOnly };

/** By keyboard: the calendar opens with Enter and closes with Escape, and the clear control is its own tab stop. */
export const Keyboard: Story = {
  args: config.stories.Plain,
  play: async ({ canvasElement }) => {
    const trigger = focusStoryField(canvasElement, 'period');
    await userEvent.keyboard('{Enter}');
    const body = within(canvasElement.ownerDocument.body);
    await expect((await body.findAllByRole('grid')).length).toBeGreaterThan(0);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.tab();
    await expect(canvasElement.ownerDocument.activeElement).toHaveAccessibleName('Clear date');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(trigger).toHaveAttribute('data-placeholder'));
  },
};
