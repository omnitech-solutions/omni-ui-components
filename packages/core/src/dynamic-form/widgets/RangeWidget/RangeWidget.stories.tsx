import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  descriptionVolumeFixture,
  disabledVolumeFixture,
  fineStepVolumeFixture,
  plainVolumeFixture,
  prefilledVolumeFixture,
  type VolumeFormData,
} from 'factories/dynamic-form/widgets/RangeWidget/RangeWidget.factories';

type Args = DynamicFormStoryArgs<VolumeFormData>;

const config = defineDynamicFormStories<VolumeFormData>({
  title: 'dynamic-form/widgets/RangeWidget',
  fixtures: {
    plain: plainVolumeFixture,
    description: descriptionVolumeFixture,
    fineStep: fineStepVolumeFixture,
    prefilled: prefilledVolumeFixture,
    disabled: disabledVolumeFixture,
  },
  titles: {
    plain: 'RangeWidget',
    description: 'RangeWidget · description',
    fineStep: 'RangeWidget · step=5',
    prefilled: 'RangeWidget · prefilled',
    disabled: 'RangeWidget · disabled',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'RangeWidget',
    whenToUse: [
      'Numeric slider for `type: number | integer` schemas with `minimum`/`maximum`.',
      'Reads min/max/step via `rangeSpec(schema)`; `ui:options.step` overrides the schema step.',
      'Routes through the Omni `SliderPrimitive` so the look matches the rest of the design system.',
    ].join(' '),
  },
  stories: {
    Plain: { fixture: 'plain' },
    WithDescription: { fixture: 'description' },
    FineStep: { fixture: 'fineStep' },
    Prefilled: { fixture: 'prefilled' },
    Disabled: { fixture: 'disabled' },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/RangeWidget',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;

export const Plain: Story = { args: config.stories.Plain };
export const WithDescription: Story = { args: config.stories.WithDescription };
export const FineStep: Story = { args: config.stories.FineStep };
export const Prefilled: Story = { args: config.stories.Prefilled };
export const Disabled: Story = { args: config.stories.Disabled };
