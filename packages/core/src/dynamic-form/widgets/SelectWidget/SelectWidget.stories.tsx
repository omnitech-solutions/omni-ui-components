import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  descriptionCountryFixture,
  groupedSelectFixture,
  placeholderCountryFixture,
  plainCountryFixture,
  prefilledCountryFixture,
  searchableCountryFixture,
  validationCountryFixture,
  withFooterActionSelectFixture,
  type CountryFormData,
} from 'factories/dynamic-form/widgets/SelectWidget/SelectWidget.factories';

type Args = DynamicFormStoryArgs<Record<string, unknown>>;
type _UseImport = CountryFormData;

const config = defineDynamicFormStories<Record<string, unknown>>({
  title: 'dynamic-form/widgets/SelectWidget',
  fixtures: {
    plain: plainCountryFixture as never,
    placeholder: placeholderCountryFixture as never,
    description: descriptionCountryFixture as never,
    prefilled: prefilledCountryFixture as never,
    searchable: searchableCountryFixture as never,
    validation: validationCountryFixture as never,
    grouped: groupedSelectFixture as never,
    footerAction: withFooterActionSelectFixture as never,
  },
  titles: {
    plain: 'SelectWidget',
    placeholder: 'SelectWidget · placeholder',
    description: 'SelectWidget · description',
    prefilled: 'SelectWidget · prefilled',
    searchable: 'SelectWidget · searchable',
    validation: 'SelectWidget · required',
    grouped: 'SelectWidget · grouped options',
    footerAction: 'SelectWidget · footer action',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'SelectWidget',
    whenToUse: [
      'Like TextWidget / TextareaWidget, never rendered standalone — every story exercises the full',
      'DynamicForm ancestry (Form → ObjectFieldTemplate → FieldTemplate → StringField → SelectWidget →',
      'SelectPrimitive). Options come from `schema.enum` / `schema.enumNames`; placeholder + emptyValue',
      'are driven by `ui:options`.',
    ].join(' '),
  },
  stories: {
    Plain: { fixture: 'plain' },
    WithPlaceholder: { fixture: 'placeholder' },
    WithDescription: { fixture: 'description' },
    Prefilled: { fixture: 'prefilled' },
    Searchable: { fixture: 'searchable' },
    ValidationError: {
      fixture: 'validation',
      submitLabel: 'Try to save (will fail)',
      autoSubmit: true,
    },
    GroupedOptions: { fixture: 'grouped' },
    WithFooterAction: { fixture: 'footerAction' },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/SelectWidget',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;

export const Plain: Story = { args: config.stories.Plain };
export const WithPlaceholder: Story = { args: config.stories.WithPlaceholder };
export const WithDescription: Story = { args: config.stories.WithDescription };
export const Prefilled: Story = { args: config.stories.Prefilled };
export const Searchable: Story = { args: config.stories.Searchable };
export const ValidationError: Story = { args: config.stories.ValidationError };
export const GroupedOptions: Story = { args: config.stories.GroupedOptions };
export const WithFooterAction: Story = { args: config.stories.WithFooterAction };
