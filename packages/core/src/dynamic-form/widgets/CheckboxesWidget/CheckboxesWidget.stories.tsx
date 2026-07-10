import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  descriptionsChannelsFixture,
  disabledOptionChannelsFixture,
  inlineChannelsFixture,
  plainChannelsFixture,
  prefilledChannelsFixture,
  validationChannelsFixture,
  type ChannelsFormData,
} from 'factories/dynamic-form/widgets/CheckboxesWidget/CheckboxesWidget.factories';

type Args = DynamicFormStoryArgs<ChannelsFormData>;

const config = defineDynamicFormStories<ChannelsFormData>({
  title: 'dynamic-form/widgets/CheckboxesWidget',
  fixtures: {
    plain: plainChannelsFixture,
    inline: inlineChannelsFixture,
    descriptions: descriptionsChannelsFixture,
    prefilled: prefilledChannelsFixture,
    validation: validationChannelsFixture,
    disabledOption: disabledOptionChannelsFixture,
  },
  titles: {
    plain: 'CheckboxesWidget',
    inline: 'CheckboxesWidget · inline',
    descriptions: 'CheckboxesWidget · descriptions',
    prefilled: 'CheckboxesWidget · prefilled',
    validation: 'CheckboxesWidget · required',
    disabledOption: 'CheckboxesWidget · disabled option',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'CheckboxesWidget',
    whenToUse: [
      'Array-of-enum checkbox group; never standalone — every story exercises the full DynamicForm ancestry',
      '(Form → ObjectFieldTemplate → FieldTemplate → ArrayField → CheckboxesWidget → CheckboxGroupPrimitive).',
      'Options come from `items.oneOf` / `items.enum`. `ui:options.inline` lays inline;',
      '`ui:enumDisabled` greys out specific values; `ui:options.optionDescriptions` adds per-option descriptions.',
    ].join(' '),
  },
  stories: {
    Plain: { fixture: 'plain' },
    Inline: { fixture: 'inline' },
    WithDescriptions: { fixture: 'descriptions' },
    Prefilled: { fixture: 'prefilled' },
    DisabledOption: { fixture: 'disabledOption' },
    ValidationError: {
      fixture: 'validation',
      submitLabel: 'Try to save (will fail)',
      autoSubmit: true,
    },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/CheckboxesWidget',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;

export const Plain: Story = { args: config.stories.Plain };
export const Inline: Story = { args: config.stories.Inline };
export const WithDescriptions: Story = { args: config.stories.WithDescriptions };
export const Prefilled: Story = { args: config.stories.Prefilled };
export const DisabledOption: Story = { args: config.stories.DisabledOption };
export const ValidationError: Story = { args: config.stories.ValidationError };
