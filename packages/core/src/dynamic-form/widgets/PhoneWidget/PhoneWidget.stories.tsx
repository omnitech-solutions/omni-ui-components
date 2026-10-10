import type { Meta, StoryObj } from '@storybook/react';
import { playKeyboardReach } from 'factories/dynamic-form/DynamicForm/widgetPlay.factories';
import {
  type PhoneFormData,
  prefilledPhoneFixture,
  ukPhoneFixture,
  usPhoneFixture,
} from 'factories/dynamic-form/widgets/PhoneWidget/PhoneWidget.factories';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<PhoneFormData>;

const config = defineDynamicFormStories<PhoneFormData>({
  title: 'dynamic-form/widgets/PhoneWidget',
  fixtures: { us: usPhoneFixture, uk: ukPhoneFixture, prefilled: prefilledPhoneFixture },
  titles: {
    us: 'PhoneWidget · US',
    uk: 'PhoneWidget · UK (+44)',
    prefilled: 'PhoneWidget · prefilled',
  },
  defaultArgs: { fixture: 'us' },
  docs: {
    name: 'PhoneWidget',
    whenToUse:
      'Formatted phone input. `ui:options.defaultDialCode` switches to international grouping (e.g. `+44`).',
  },
  stories: { US: { fixture: 'us' }, UK: { fixture: 'uk' }, Prefilled: { fixture: 'prefilled' } },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/PhoneWidget',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;
export const US: Story = { args: config.stories.US };
export const UK: Story = { args: config.stories.UK };
export const Prefilled: Story = { args: config.stories.Prefilled };

/** Reached and left by the keyboard alone (focus arrives by the field's key, as a host does it). */
export const Keyboard: Story = { args: config.stories.US, play: playKeyboardReach };
