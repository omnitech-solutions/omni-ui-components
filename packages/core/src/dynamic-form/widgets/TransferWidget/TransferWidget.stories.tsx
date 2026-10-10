import type { Meta, StoryObj } from '@storybook/react';
import { focusStoryField } from 'factories/dynamic-form/DynamicForm/widgetPlay.factories';
import {
  disabledTransferFixture,
  oneWayTransferFixture,
  plainTransferFixture,
  readOnlyTransferFixture,
  requiredTransferFixture,
  searchableTransferFixture,
} from 'factories/dynamic-form/widgets/TransferWidget/TransferWidget.factories';
import { expect, userEvent, within } from 'storybook/test';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type Args = DynamicFormStoryArgs<Record<string, unknown>>;

const config = defineDynamicFormStories<Record<string, unknown>>({
  title: 'dynamic-form/widgets/TransferWidget',
  fixtures: {
    plain: plainTransferFixture as never,
    required: requiredTransferFixture as never,
    disabled: disabledTransferFixture as never,
    readOnly: readOnlyTransferFixture as never,
    searchable: searchableTransferFixture as never,
    oneWay: oneWayTransferFixture as never,
  },
  titles: {
    plain: 'TransferWidget · plain',
    required: 'TransferWidget · required',
    disabled: 'TransferWidget · disabled',
    readOnly: 'TransferWidget · readOnly',
    searchable: 'TransferWidget · searchable',
    oneWay: 'TransferWidget · oneWay',
  },
  defaultArgs: { fixture: 'plain' },
  docs: {
    name: 'TransferWidget',
    whenToUse:
      'Several choices moved from one list to another; the stored value is the chosen keys. Same schema as `multiSelect`; made for long lists. `ui:options.searchable`, `oneWay`.',
  },
  stories: {
    Plain: { fixture: 'plain' },
    Prefilled: { fixture: 'plain', prefilled: true },
    Required: { fixture: 'required' },
    Disabled: { fixture: 'disabled', prefilled: true },
    ReadOnly: { fixture: 'readOnly', prefilled: true },
    Searchable: { fixture: 'searchable' },
    OneWay: { fixture: 'oneWay' },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/widgets/TransferWidget',
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
export const Searchable: Story = { args: config.stories.Searchable };
export const OneWay: Story = { args: config.stories.OneWay };

/** Driven by the keyboard alone: focus arrives in the field by its key, as a host does it. */
export const Keyboard: Story = {
  args: config.stories.Plain,
  play: async ({ canvasElement }) => {
    focusStoryField(canvasElement);
    await userEvent.keyboard(' ');
    await userEvent.keyboard('{Enter}');
    const lists = within(canvasElement).getAllByRole('listbox');
    await expect(within(lists[1]).getByRole('option', { name: /Design/ })).toBeInTheDocument();
  },
};
