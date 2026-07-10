import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  plainNumberFixture,
  thousandSeparatorNumberFixture,
  withSuffixNumberFixture,
  type ScoreFormData,
} from 'factories/dynamic-form/widgets/NumberInputWidget/NumberInputWidget.factories';

type Args = DynamicFormStoryArgs<ScoreFormData>;

const config = defineDynamicFormStories<ScoreFormData>({
  title: 'dynamic-form/widgets/NumberInputWidget',
  fixtures: { plain: plainNumberFixture, thousands: thousandSeparatorNumberFixture, suffix: withSuffixNumberFixture },
  titles: { plain: 'NumberInputWidget', thousands: 'NumberInputWidget · thousand separators', suffix: 'NumberInputWidget · suffix' },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'NumberInputWidget',
    whenToUse: 'Formatted numeric input for `type: number | integer`. `ui:options.thousandSeparator`, `prefix`, `suffix`, `decimals`.',
  },
  stories: { Plain: { fixture: 'plain' }, ThousandSeparator: { fixture: 'thousands' }, WithSuffix: { fixture: 'suffix' } },
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
