import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  addressFormFactory,
  automationFormFactory,
  kitchenSinkFormFactory,
  type AddressFormData,
  type AutomationFormData,
  type KitchenSinkFormData,
} from 'factories/dynamic-form/DynamicForm/DynamicForm.factories';

type AnyFormData = AddressFormData | AutomationFormData | KitchenSinkFormData;
type Args = DynamicFormStoryArgs<AnyFormData>;

const config = defineDynamicFormStories<AnyFormData>({
  title: 'dynamic-form/DynamicForm',
  fixtures: {
    kitchenSink: kitchenSinkFormFactory as () => any,
    address: addressFormFactory as () => any,
    automation: automationFormFactory as () => any,
  },
  titles: {
    kitchenSink: 'Account & address',
    address: 'Add Address',
    automation: 'Automation',
  },
  submitLabels: {
    address: 'Save Address',
    automation: 'Save automation',
  },
  defaultArgs: { fixture: 'kitchenSink' },
  docs: {
    name: 'DynamicForm',
    whenToUse: [
      'Omni RJSF facade — AJV runs at render-time, Zod runs at submit. Feature widgets / fields / templates',
      'layer over the app registries; submit chrome is feature-owned via `children`. Two-column layouts use',
      'the flat `ui:rows: string[][]` API in the uiSchema.',
    ].join(' '),
  },
  stories: {
    KitchenSink: { fixture: 'kitchenSink' },
    AddAddress: { fixture: 'address' },
    AutomationTextFields: { fixture: 'automation' },
    Disabled: { fixture: 'automation', prefilled: true, disabled: true },
    ReadOnly: {
      fixture: 'automation',
      prefilled: true,
      formData: {
        name: 'Welcome email automation',
        subject: 'Welcome aboard',
        message: "We're looking forward to working with you.",
      } as any,
      readOnly: true,
    },
    ValidationErrors: {
      fixture: 'automation',
      submitLabel: 'Try to save (will fail)',
      autoSubmit: true,
    },
    ApiError: {
      fixture: 'kitchenSink',
      prefilled: true,
      onSubmitMode: 'reject',
      autoSubmit: true,
    },
    AsyncSubmit: {
      fixture: 'kitchenSink',
      prefilled: true,
      onSubmitMode: 'slow',
    },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/DynamicForm',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;

export const KitchenSink: Story = { args: config.stories.KitchenSink };
export const AddAddress: Story = { args: config.stories.AddAddress };
export const AutomationTextFields: Story = { args: config.stories.AutomationTextFields };
export const Disabled: Story = { args: config.stories.Disabled };
export const ReadOnly: Story = { args: config.stories.ReadOnly };
export const ValidationErrors: Story = { args: config.stories.ValidationErrors };
export const ApiError: Story = { args: config.stories.ApiError };
export const AsyncSubmit: Story = { args: config.stories.AsyncSubmit };
