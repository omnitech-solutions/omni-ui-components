import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  disabledNotifyFixture,
  plainNotifyFixture,
  prefilledNotifyFixture,
  type NotifyFormData,
} from 'factories/dynamic-form/widgets/SwitchWidget/SwitchWidget.factories';

type Args = DynamicFormStoryArgs<NotifyFormData>;

const config = defineDynamicFormStories<NotifyFormData>({
  title: 'dynamic-form/widgets/SwitchWidget',
  fixtures: { plain: plainNotifyFixture, prefilled: prefilledNotifyFixture, disabled: disabledNotifyFixture },
  titles: { plain: 'SwitchWidget', prefilled: 'SwitchWidget · prefilled', disabled: 'SwitchWidget · disabled' },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'SwitchWidget',
    whenToUse: ['Toggle for boolean settings. Same data contract as `checkbox` but a distinct UX.'].join(' '),
  },
  stories: { Plain: { fixture: 'plain' }, Prefilled: { fixture: 'prefilled' }, Disabled: { fixture: 'disabled' } },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/SwitchWidget',
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
