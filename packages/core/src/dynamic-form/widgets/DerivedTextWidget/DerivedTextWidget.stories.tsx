import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  defaultDerivedTextFixture,
  prefilledDerivedTextFixture,
  successToneDerivedTextFixture,
  type AmountFormData,
} from 'factories/dynamic-form/widgets/DerivedTextWidget/DerivedTextWidget.factories';

type Args = DynamicFormStoryArgs<AmountFormData>;

const config = defineDynamicFormStories<AmountFormData>({
  title: 'dynamic-form/widgets/DerivedTextWidget',
  fixtures: {
    default: defaultDerivedTextFixture,
    prefilled: prefilledDerivedTextFixture,
    success: successToneDerivedTextFixture,
  },
  titles: {
    default: 'DerivedTextWidget',
    prefilled: 'DerivedTextWidget · prefilled',
    success: 'DerivedTextWidget · success tone',
  },
  defaultArgs: { fixture: 'default' },
  docs: {
    name: 'DerivedTextWidget',
    whenToUse: [
      'Render a read-only formatted string computed from formData. The widget reads from',
      '`formContext.derived[ui:options.derivedKey]`; it never writes to formData and the value is',
      'NOT part of the submit payload. Use it for Excluding Tax, Sales Price, summaries, counts.',
    ].join(' '),
  },
  stories: {
    Default: { fixture: 'default' },
    Prefilled: { fixture: 'prefilled' },
    SuccessTone: { fixture: 'success' },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/DerivedTextWidget',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;

export const Default: Story = { args: config.stories.Default };
export const Prefilled: Story = { args: config.stories.Prefilled };
export const SuccessTone: Story = { args: config.stories.SuccessTone };
