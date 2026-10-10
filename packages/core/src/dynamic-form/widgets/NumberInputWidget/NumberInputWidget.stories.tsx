import type { Meta, StoryObj } from '@storybook/react';
import { playKeyboardReach } from 'factories/dynamic-form/DynamicForm/widgetPlay.factories';
import {
  plainNumberFixture,
  type ScoreFormData,
  thousandSeparatorNumberFixture,
  withSuffixNumberFixture,
} from 'factories/dynamic-form/widgets/NumberInputWidget/NumberInputWidget.factories';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<ScoreFormData>;

const config = defineDynamicFormStories<ScoreFormData>({
  title: 'dynamic-form/widgets/NumberInputWidget',
  fixtures: {
    plain: plainNumberFixture,
    thousands: thousandSeparatorNumberFixture,
    suffix: withSuffixNumberFixture,
  },
  titles: {
    plain: 'NumberInputWidget',
    thousands: 'NumberInputWidget · thousand separators',
    suffix: 'NumberInputWidget · suffix',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'NumberInputWidget',
    whenToUse:
      'Formatted numeric input for `type: number | integer`. `ui:options.thousandSeparator`, `prefix`, `suffix`, `decimals`.',
  },
  stories: {
    Plain: { fixture: 'plain' },
    ThousandSeparator: { fixture: 'thousands' },
    WithSuffix: { fixture: 'suffix' },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/NumberInputWidget',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;
export const Plain: Story = { args: config.stories.Plain };
export const ThousandSeparator: Story = { args: config.stories.ThousandSeparator };
export const WithSuffix: Story = { args: config.stories.WithSuffix };

/** Reached and left by the keyboard alone (focus arrives by the field's key, as a host does it). */
export const Keyboard: Story = { args: config.stories.Plain, play: playKeyboardReach };
