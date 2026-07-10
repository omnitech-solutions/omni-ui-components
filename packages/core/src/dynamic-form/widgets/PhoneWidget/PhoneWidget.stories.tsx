import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import { prefilledPhoneFixture, ukPhoneFixture, usPhoneFixture, type PhoneFormData } from 'factories/dynamic-form/widgets/PhoneWidget/PhoneWidget.factories';

type Args = DynamicFormStoryArgs<PhoneFormData>;

const config = defineDynamicFormStories<PhoneFormData>({
  title: 'dynamic-form/widgets/PhoneWidget',
  fixtures: { us: usPhoneFixture, uk: ukPhoneFixture, prefilled: prefilledPhoneFixture },
  titles: { us: 'PhoneWidget · US', uk: 'PhoneWidget · UK (+44)', prefilled: 'PhoneWidget · prefilled' },
  defaultArgs: { fixture: 'us' },
  docs: { name: 'PhoneWidget', whenToUse: 'Formatted phone input. `ui:options.defaultDialCode` switches to international grouping (e.g. `+44`).' },
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
