import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  customPlaceholderComboboxFixture,
  groupedMemberComboboxFixture,
  plainComboboxFixture,
  prefilledComboboxFixture,
  projectComboboxFixture,
  type CountryFormData,
} from 'factories/dynamic-form/widgets/ComboboxWidget/ComboboxWidget.factories';

type Args = DynamicFormStoryArgs<Record<string, unknown>>;
type _UseImport = CountryFormData;

const config = defineDynamicFormStories<Record<string, unknown>>({
  title: 'dynamic-form/widgets/ComboboxWidget',
  fixtures: {
    plain: plainComboboxFixture as never,
    prefilled: prefilledComboboxFixture as never,
    custom: customPlaceholderComboboxFixture as never,
    project: projectComboboxFixture as never,
    groupedMember: groupedMemberComboboxFixture as never,
  },
  titles: {
    plain: 'ComboboxWidget',
    prefilled: 'ComboboxWidget · prefilled',
    custom: 'ComboboxWidget · custom placeholder',
    project: 'ComboboxWidget · option set + description + color',
    groupedMember: 'ComboboxWidget · grouped options',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'ComboboxWidget',
    whenToUse:
      'Same data contract as `select` but forces `searchable=true`. Use for long enum lists, or sourced from formContext.optionSets when option metadata (group / description / color / initials) is needed.',
  },
  stories: {
    Plain: { fixture: 'plain' },
    Prefilled: { fixture: 'prefilled' },
    CustomPlaceholder: { fixture: 'custom' },
    WithOptionSet: { fixture: 'project' },
    GroupedOptions: { fixture: 'groupedMember' },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/ComboboxWidget',
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
export const CustomPlaceholder: Story = { args: config.stories.CustomPlaceholder };
export const WithOptionSet: Story = { args: config.stories.WithOptionSet };
export const GroupedOptions: Story = { args: config.stories.GroupedOptions };
