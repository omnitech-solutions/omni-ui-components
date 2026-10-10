import type { Meta, StoryObj } from '@storybook/react';
import {
  boundedCalendarFixture,
  disabledCalendarFixture,
  plainCalendarFixture,
  readOnlyCalendarFixture,
  requiredCalendarFixture,
} from 'factories/dynamic-form/widgets/CalendarWidget/CalendarWidget.factories';
import { expect, userEvent, within } from 'storybook/test';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<Record<string, unknown>>;

const config = defineDynamicFormStories<Record<string, unknown>>({
  title: 'dynamic-form/widgets/CalendarWidget',
  fixtures: {
    plain: plainCalendarFixture as never,
    required: requiredCalendarFixture as never,
    disabled: disabledCalendarFixture as never,
    readOnly: readOnlyCalendarFixture as never,
    bounded: boundedCalendarFixture as never,
  },
  titles: {
    plain: 'CalendarWidget · plain',
    required: 'CalendarWidget · required',
    disabled: 'CalendarWidget · disabled',
    readOnly: 'CalendarWidget · readOnly',
    bounded: 'CalendarWidget · bounded',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'CalendarWidget',
    whenToUse:
      'One day chosen on an always-open month grid, stored as `YYYY-MM-DD`. `ui:options.min` and `max` bound the days.',
  },
  stories: {
    Plain: { fixture: 'plain' },
    Prefilled: { fixture: 'plain', prefilled: true },
    Required: { fixture: 'required' },
    Disabled: { fixture: 'disabled', prefilled: true },
    ReadOnly: { fixture: 'readOnly', prefilled: true },
    Bounded: { fixture: 'bounded' },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/CalendarWidget',
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
export const Bounded: Story = { args: config.stories.Bounded };

/** Driven by the keyboard alone: focus arrives in the field by its key, as a host does it. */
export const Keyboard: Story = {
  args: config.stories.Plain,
  play: async ({ canvasElement }) => {
    const grid = within(canvasElement).getByRole('grid');
    const day = grid.querySelector('button[tabindex="0"]') as HTMLElement;
    day.focus();
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{Enter}');
    await expect(grid.querySelector('[data-selected-single="true"]')).toHaveFocus();
  },
};
