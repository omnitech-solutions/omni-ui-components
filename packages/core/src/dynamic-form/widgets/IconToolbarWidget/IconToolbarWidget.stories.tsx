import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  destructiveOnlyQuickActionsFixture,
  plainQuickActionsFixture,
  type QuickActionsFormData,
} from 'factories/dynamic-form/widgets/IconToolbarWidget/IconToolbarWidget.factories';

type Args = DynamicFormStoryArgs<QuickActionsFormData>;

const config = defineDynamicFormStories<QuickActionsFormData>({
  title: 'dynamic-form/widgets/IconToolbarWidget',
  fixtures: {
    plain: plainQuickActionsFixture,
    destructive: destructiveOnlyQuickActionsFixture,
  },
  titles: {
    plain: 'IconToolbarWidget',
    destructive: 'IconToolbarWidget · destructive only',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'IconToolbarWidget',
    whenToUse: [
      'Non-data RJSF widget that surfaces Omni IconButtons in form chrome.',
      'Drive the toolbar via `ui:widget: "iconToolbar"` + `ui:options.actions`.',
      'Trash2 auto-defaults to the destructive variant; supply `variant` per action to override.',
    ].join(' '),
  },
  stories: {
    Plain: { fixture: 'plain' },
    Destructive: { fixture: 'destructive' },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/IconToolbarWidget',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;

export const Plain: Story = { args: config.stories.Plain };
export const Destructive: Story = { args: config.stories.Destructive };
