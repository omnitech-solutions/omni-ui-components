import type { Meta, StoryObj } from '@storybook/react';

import { defineDynamicFormStories, type DynamicFormStoryArgs } from 'storybook-helpers/defineDynamicFormStories';
import {
  collapsibleClosedFixture,
  collapsibleOpenFixture,
  labelActionLinkFixture,
  labelActionSpanFixture,
  staticPanelFixture,
} from 'factories/dynamic-form/templates/TemplateEnhancements.factories';

type Args = DynamicFormStoryArgs<Record<string, unknown>>;

const config = defineDynamicFormStories<Record<string, unknown>>({
  title: 'dynamic-form/Templates/Enhancements',
  fixtures: {
    collapsibleClosed: collapsibleClosedFixture as never,
    collapsibleOpen: collapsibleOpenFixture as never,
    labelActionLink: labelActionLinkFixture as never,
    labelActionSpan: labelActionSpanFixture as never,
    staticPanel: staticPanelFixture as never,
  },
  titles: {
    collapsibleClosed: 'ObjectFieldTemplate · collapsible (closed)',
    collapsibleOpen: 'ObjectFieldTemplate · collapsible (open)',
    labelActionLink: 'FieldTemplate · labelAction (link)',
    labelActionSpan: 'FieldTemplate · labelAction (span)',
    staticPanel: 'StaticPanelField · timer header',
  },
  defaultArgs: { fixture: 'collapsibleClosed' },
  docs: {
    name: 'Template Enhancements',
    whenToUse:
      'PR 4 additions exercised in isolation: collapsible ObjectFieldTemplate, FieldTemplate labelAction slot, and StaticPanelField (non-input display).',
  },
  stories: {
    CollapsibleClosed: { fixture: 'collapsibleClosed' },
    CollapsibleOpen: { fixture: 'collapsibleOpen' },
    LabelActionLink: { fixture: 'labelActionLink' },
    LabelActionSpan: { fixture: 'labelActionSpan' },
    StaticPanel: { fixture: 'staticPanel' },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/Templates/Enhancements',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;
export const CollapsibleClosed: Story = { args: config.stories.CollapsibleClosed };
export const CollapsibleOpen: Story = { args: config.stories.CollapsibleOpen };
export const LabelActionLink: Story = { args: config.stories.LabelActionLink };
export const LabelActionSpan: Story = { args: config.stories.LabelActionSpan };
export const StaticPanel: Story = { args: config.stories.StaticPanel };
