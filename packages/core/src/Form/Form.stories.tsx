import type { Meta, StoryObj } from '@storybook/react';

import { defineFormStories, type FormStoryArgs } from 'storybook-helpers/defineFormStories';
import {
  addressFormFactory,
  contactFormFactory,
  kitchenSinkFormFactory,
  signupFormFactory,
  type AddressFormData,
  type ContactFormData,
  type KitchenSinkFormData,
  type SignupFormData,
} from 'factories/omni-ui-components/Form/Form.factories';

type AnyFormData = AddressFormData | ContactFormData | SignupFormData | KitchenSinkFormData;
type Args = FormStoryArgs<AnyFormData>;

const config = defineFormStories<AnyFormData>({
  title: 'omni-ui-components/Form',
  fixtures: {
    kitchenSink: kitchenSinkFormFactory as () => any,
    address: addressFormFactory as () => any,
    contact: contactFormFactory as () => any,
    signup: signupFormFactory as () => any,
  },
  defaultArgs: { fixture: 'kitchenSink' },
  docs: {
    name: 'Form',
    whenToUse: [
      'Use `Form` for any Zod-validated form with manual field composition. Pair with',
      '`<FormField>` (single field), `<FormRow>` (N-col grid), `<FormActions>` (divider +',
      'submit row). `DynamicForm` (RJSF facade) composes the same primitive, so vanilla',
      'and schema-driven forms share one submit contract (`FormError[]`).',
    ].join(' '),
    accessibility: [
      '- Labels render via `<label htmlFor>` and bind to the input id.',
      '- Required fields render an aria-hidden `*` marker and set `aria-required`.',
      '- Errors render via `role="alert"` and propagate via `aria-invalid`.',
      '- `disabled` / `readOnly` propagate from `<Form>` through context.',
    ].join('\n'),
  },
  stories: {
    KitchenSink: { fixture: 'kitchenSink' },
    AddAddress: { fixture: 'address' },
    Contact: { fixture: 'contact' },
    Prefilled: {
      fixture: 'kitchenSink',
      prefilled: true,
      formData: {
        full_name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'Hunter22',
        phone: '+1 555 0100',
        label: 'HQ',
        address1: '123 Main St',
        city: 'San Francisco',
        postal_code: 94105 as any,
        country: 'US',
        region: 'CA',
        website: 'https://example.com',
      },
    },
    Disabled: {
      fixture: 'kitchenSink',
      prefilled: true,
      formData: { full_name: 'Ada', email: 'ada@example.com', label: 'HQ', city: 'SF', country: 'US' } as any,
      disabled: true,
    },
    ReadOnly: {
      fixture: 'kitchenSink',
      prefilled: true,
      formData: { full_name: 'Ada', email: 'ada@example.com', label: 'HQ', city: 'SF', country: 'US' } as any,
      readOnly: true,
    },
    ValidationErrors: {
      fixture: 'kitchenSink',
      prefilled: true,
      formData: {
        full_name: 'A', // too short
        email: 'not-an-email', // bad email
        password: 'weak', // fails min / uppercase / number
        phone: '123', // too short
        label: '', // required
        address1: '', // required
        city: '', // required
        postal_code: '' as any, // required + must be number
        country: '', // required
        region: '', // required
        website: 'omni.com', // bad url
      },
      autoSubmit: true,
    },
    ApiError: {
      fixture: 'kitchenSink',
      prefilled: true,
      formData: {
        full_name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'Hunter22',
        phone: '+1 555 0100',
        label: 'HQ',
        address1: '123 Main St',
        city: 'San Francisco',
        postal_code: 94105 as any,
        country: 'US',
        region: 'CA',
        website: 'https://example.com',
      },
      onSubmitMode: 'reject',
      autoSubmit: true,
    },
    AsyncSubmit: {
      fixture: 'kitchenSink',
      prefilled: true,
      formData: {
        full_name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'Hunter22',
        phone: '+1 555 0100',
        label: 'HQ',
        address1: '123 Main St',
        city: 'San Francisco',
        postal_code: 94105 as any,
        country: 'US',
        region: 'CA',
        website: 'https://example.com',
      },
      onSubmitMode: 'slow',
    },
  },
});

const meta: Meta<Args> = {
  title: 'omni-ui-components/Form',
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
export const Contact: Story = { args: config.stories.Contact };
export const Prefilled: Story = { args: config.stories.Prefilled };
export const Disabled: Story = { args: config.stories.Disabled };
export const ReadOnly: Story = { args: config.stories.ReadOnly };
export const ValidationErrors: Story = { args: config.stories.ValidationErrors, play: config.play.ValidationErrors };
export const ApiError: Story = { args: config.stories.ApiError, play: config.play.ApiError };
export const AsyncSubmit: Story = { args: config.stories.AsyncSubmit };
