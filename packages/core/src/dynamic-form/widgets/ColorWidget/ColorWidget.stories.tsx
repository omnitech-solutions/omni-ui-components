import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  disabledColorFixture,
  plainColorFixture,
  redColorFixture,
  type ColorFormData,
} from 'factories/dynamic-form/widgets/ColorWidget/ColorWidget.factories';

type Args = DynamicFormStoryArgs<ColorFormData>;

const config = defineDynamicFormStories<ColorFormData>({
  title: 'dynamic-form/widgets/ColorWidget',
  fixtures: { plain: plainColorFixture, red: redColorFixture, disabled: disabledColorFixture },
  titles: { plain: 'ColorWidget', red: 'ColorWidget · red preset', disabled: 'ColorWidget · disabled' },
  defaultArgs: { fixture: 'plain' },
  docs: { name: 'ColorWidget', whenToUse: 'Popover + hex input + preset palette for `type: "string", format: "color"`. Submits `#rrggbb`.' },
  stories: { Plain: { fixture: 'plain' }, Red: { fixture: 'red' }, Disabled: { fixture: 'disabled' } },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/ColorWidget',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;
export const Plain: Story = { args: config.stories.Plain };
export const Red: Story = { args: config.stories.Red };
export const Disabled: Story = { args: config.stories.Disabled };
