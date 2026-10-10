import type { Meta, StoryObj } from '@storybook/react';
import { playKeyboardReach } from 'factories/dynamic-form/DynamicForm/widgetPlay.factories';
import {
  plainQuickActionsFixture,
  type QuickActionsFormData,
  withLinkQuickActionsFixture,
} from 'factories/dynamic-form/widgets/IconToolbarWidget/IconToolbarWidget.factories';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<QuickActionsFormData>;

const config = defineDynamicFormStories<QuickActionsFormData>({
  title: 'dynamic-form/widgets/IconToolbarWidget',
  fixtures: {
    plain: plainQuickActionsFixture,
    withLink: withLinkQuickActionsFixture,
  },
  titles: {
    plain: 'IconToolbarWidget',
    withLink: 'IconToolbarWidget · with a link',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'IconToolbarWidget',
    whenToUse: [
      'A row of actions that belong to the form. It holds no value and nothing is submitted.',
      '`ui:options.actions` is plain data: `[{ actionKey, variant }]`.',
      'Each action (its words, its icon node and what it does) comes from `formContext.actions[actionKey]`: no function and no icon name sits in a schema.',
    ].join(' '),
  },
  stories: {
    Plain: { fixture: 'plain' },
    WithLink: { fixture: 'withLink' },
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
export const WithLink: Story = { args: config.stories.WithLink };

/** Reached and left by the keyboard alone (focus arrives by the field's key, as a host does it). */
export const Keyboard: Story = { args: config.stories.Plain, play: playKeyboardReach };
