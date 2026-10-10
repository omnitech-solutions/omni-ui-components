import type { Meta, StoryObj } from '@storybook/react';
import { focusStoryField } from 'factories/dynamic-form/DynamicForm/widgetPlay.factories';
import {
  disabledPasswordFixture,
  newPasswordPasswordFixture,
  noTogglePasswordFixture,
  plainPasswordFixture,
  readOnlyPasswordFixture,
  requiredPasswordFixture,
} from 'factories/dynamic-form/widgets/PasswordWidget/PasswordWidget.factories';
import { expect, userEvent } from 'storybook/test';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<Record<string, unknown>>;

const config = defineDynamicFormStories<Record<string, unknown>>({
  title: 'dynamic-form/widgets/PasswordWidget',
  fixtures: {
    plain: plainPasswordFixture as never,
    required: requiredPasswordFixture as never,
    disabled: disabledPasswordFixture as never,
    readOnly: readOnlyPasswordFixture as never,
    noToggle: noTogglePasswordFixture as never,
    newPassword: newPasswordPasswordFixture as never,
  },
  titles: {
    plain: 'PasswordWidget · plain',
    required: 'PasswordWidget · required',
    disabled: 'PasswordWidget · disabled',
    readOnly: 'PasswordWidget · readOnly',
    noToggle: 'PasswordWidget · noToggle',
    newPassword: 'PasswordWidget · newPassword',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'PasswordWidget',
    whenToUse:
      'A password box with its reveal control. `ui:options.toggleable: false` draws the bare box; `ui:options.autocomplete` is `current-password` or `new-password`.',
  },
  stories: {
    Plain: { fixture: 'plain' },
    Prefilled: { fixture: 'plain', prefilled: true },
    Required: { fixture: 'required' },
    Disabled: { fixture: 'disabled', prefilled: true },
    ReadOnly: { fixture: 'readOnly', prefilled: true },
    NoToggle: { fixture: 'noToggle' },
    NewPassword: { fixture: 'newPassword' },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/PasswordWidget',
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
export const Required: Story = { args: config.stories.Required };
export const Disabled: Story = { args: config.stories.Disabled };
export const ReadOnly: Story = { args: config.stories.ReadOnly };
export const NoToggle: Story = { args: config.stories.NoToggle };
export const NewPassword: Story = { args: config.stories.NewPassword };

/** Driven by the keyboard alone: focus arrives in the field by its key, as a host does it. */
export const Keyboard: Story = {
  args: config.stories.Plain,
  play: async ({ canvasElement }) => {
    const input = focusStoryField(canvasElement) as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.keyboard('hunter2');
    await expect(input).toHaveValue('hunter2');
    await userEvent.tab();
    await userEvent.keyboard(' ');
    await expect(canvasElement.querySelector('#root_f')).toHaveAttribute('type', 'text');
  },
};
