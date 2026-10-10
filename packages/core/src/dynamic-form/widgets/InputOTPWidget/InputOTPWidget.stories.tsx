import type { Meta, StoryObj } from '@storybook/react';
import { playKeyboardReach } from 'factories/dynamic-form/DynamicForm/widgetPlay.factories';
import {
  fourDigitOtpFixture,
  type OtpFormData,
  plainOtpFixture,
  prefilledOtpFixture,
} from 'factories/dynamic-form/widgets/InputOTPWidget/InputOTPWidget.factories';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<OtpFormData>;

const config = defineDynamicFormStories<OtpFormData>({
  title: 'dynamic-form/widgets/InputOTPWidget',
  fixtures: {
    plain: plainOtpFixture,
    prefilled: prefilledOtpFixture,
    fourDigit: fourDigitOtpFixture,
  },
  titles: {
    plain: 'InputOTPWidget',
    prefilled: 'InputOTPWidget · prefilled',
    fourDigit: 'InputOTPWidget · 4 digit',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'InputOTPWidget',
    whenToUse:
      'One-time-code grid for 2FA / magic-link verification. `ui:options.length` overrides slot count.',
  },
  stories: {
    Plain: { fixture: 'plain' },
    Prefilled: { fixture: 'prefilled' },
    FourDigit: { fixture: 'fourDigit' },
  },
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

/** Reached and left by the keyboard alone (focus arrives by the field's key, as a host does it). */
export const Keyboard: Story = { args: config.stories.Plain, play: playKeyboardReach };
