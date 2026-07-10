import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  fourDigitOtpFixture,
  plainOtpFixture,
  prefilledOtpFixture,
  type OtpFormData,
} from 'factories/dynamic-form/widgets/InputOTPWidget/InputOTPWidget.factories';

type Args = DynamicFormStoryArgs<OtpFormData>;

const config = defineDynamicFormStories<OtpFormData>({
  title: 'dynamic-form/widgets/InputOTPWidget',
  fixtures: { plain: plainOtpFixture, prefilled: prefilledOtpFixture, fourDigit: fourDigitOtpFixture },
  titles: { plain: 'InputOTPWidget', prefilled: 'InputOTPWidget · prefilled', fourDigit: 'InputOTPWidget · 4 digit' },
  defaultArgs: { fixture: 'plain' },
  docs: { name: 'InputOTPWidget', whenToUse: 'One-time-code grid for 2FA / magic-link verification. `ui:options.length` overrides slot count.' },
  stories: { Plain: { fixture: 'plain' }, Prefilled: { fixture: 'prefilled' }, FourDigit: { fixture: 'fourDigit' } },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/InputOTPWidget',
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
export const FourDigit: Story = { args: config.stories.FourDigit };
