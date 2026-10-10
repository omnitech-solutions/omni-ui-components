import type { Meta, StoryObj } from '@storybook/react';
import { playKeyboardReach } from 'factories/dynamic-form/DynamicForm/widgetPlay.factories';
import {
  disabledPagesFixture,
  minMaxPagesFixture,
  type PageCountFormData,
  plainPagesFixture,
  prefilledPagesFixture,
} from 'factories/dynamic-form/widgets/StepperWidget/StepperWidget.factories';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<PageCountFormData>;

const config = defineDynamicFormStories<PageCountFormData>({
  title: 'dynamic-form/widgets/StepperWidget',
  fixtures: {
    plain: plainPagesFixture,
    prefilled: prefilledPagesFixture,
    minMax: minMaxPagesFixture,
    disabled: disabledPagesFixture,
  },
  titles: {
    plain: 'StepperWidget',
    prefilled: 'StepperWidget · prefilled',
    minMax: 'StepperWidget · no icon',
    disabled: 'StepperWidget · disabled',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'StepperWidget',
    whenToUse: [
      'Numeric stepper pill (− / +) for bounded integers like page count, seat count, or duration.',
      'Reads min/max/step via `rangeSpec(schema)`. `ui:options.unit` adds singular/plural noun;',
      '`ui:options.iconKey` names a leading icon node in `formContext.icons`.',
    ].join(' '),
  },
  stories: {
    Plain: { fixture: 'plain' },
    Prefilled: { fixture: 'prefilled' },
    NoIcon: { fixture: 'minMax' },
    Disabled: { fixture: 'disabled' },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/StepperWidget',
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
export const NoIcon: Story = { args: config.stories.NoIcon };
export const Disabled: Story = { args: config.stories.Disabled };

/** Reached and left by the keyboard alone (focus arrives by the field's key, as a host does it). */
export const Keyboard: Story = { args: config.stories.Plain, play: playKeyboardReach };
