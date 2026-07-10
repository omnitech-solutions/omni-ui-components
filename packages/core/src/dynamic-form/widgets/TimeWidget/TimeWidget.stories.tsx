import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  disabledTimeFixture,
  plainTimeFixture,
  prefilledTimeFixture,
  type TimeFormData,
} from 'factories/dynamic-form/widgets/TimeWidget/TimeWidget.factories';

type Args = DynamicFormStoryArgs<TimeFormData>;

const config = defineDynamicFormStories<TimeFormData>({
  title: 'dynamic-form/widgets/TimeWidget',
  fixtures: { plain: plainTimeFixture, prefilled: prefilledTimeFixture, disabled: disabledTimeFixture },
  titles: { plain: 'TimeWidget', prefilled: 'TimeWidget · prefilled', disabled: 'TimeWidget · disabled' },
  defaultArgs: { fixture: 'plain' },
  docs: { name: 'TimeWidget', whenToUse: 'Time input for `type: "string", format: "time"`. Submits `HH:MM` (24h).' },
  stories: { Plain: { fixture: 'plain' }, Prefilled: { fixture: 'prefilled' }, Disabled: { fixture: 'disabled' } },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/TimeWidget',
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
export const Disabled: Story = { args: config.stories.Disabled };
