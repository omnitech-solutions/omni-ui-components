import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  eurBudgetFixture,
  jpyBudgetFixture,
  usdBudgetFixture,
  type BudgetFormData,
} from 'factories/dynamic-form/widgets/CurrencyWidget/CurrencyWidget.factories';

type Args = DynamicFormStoryArgs<BudgetFormData>;

const config = defineDynamicFormStories<BudgetFormData>({
  title: 'dynamic-form/widgets/CurrencyWidget',
  fixtures: { usd: usdBudgetFixture, eur: eurBudgetFixture, jpy: jpyBudgetFixture },
  titles: { usd: 'CurrencyWidget · USD', eur: 'CurrencyWidget · EUR', jpy: 'CurrencyWidget · JPY' },
  defaultArgs: { fixture: 'usd' },
  docs: { name: 'CurrencyWidget', whenToUse: 'Monetary input with locale-aware currency symbol. `ui:options.currency` + `ui:options.locale`.' },
  stories: { USD: { fixture: 'usd' }, EUR: { fixture: 'eur' }, JPY: { fixture: 'jpy' } },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/CurrencyWidget',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;
export const USD: Story = { args: config.stories.USD };
export const EUR: Story = { args: config.stories.EUR };
export const JPY: Story = { args: config.stories.JPY };
