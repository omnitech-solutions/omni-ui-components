import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { IntegrationList, type IntegrationListProps } from '@oc-tech/omni-ui-components/IntegrationList';
import { IntegrationListDemo, integrationListPropsFactory, integrationListVariants } from 'factories/omni-ui-components/IntegrationList/IntegrationList.factories';

const meta: Meta<IntegrationListProps> = {
  title: 'omni-ui-components/IntegrationList',
  component: IntegrationList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The tools an assistant may use: rows (<primary>icon tile, name, detail with a status dot, switch, remove</primary>), an <primary>add-by-address</primary> form, loading and empty states. Today\'s rows are MCP servers; an <primary>OAuth variant</primary> fits the same list through `connectAction` (list header) and each row\'s `account` and `connectAction`. Callbacks: `onToggle(id, enabled)`, `onRemove(id)`, `onAdd(url)`.\n\n<primary>Callbacks</primary> (every callback is optional; a control that exists only for a callback is not rendered when it is absent):\n\n| Callback | Fires when | Payload |\n| --- | --- | --- |\n| `onToggle` | a row\n\n<primary>Callbacks</primary> (every callback is optional; a control that exists only for a callback is not rendered when it is absent):\n\n| Callback | Fires when | Payload |\n| --- | --- | --- |\n| `onToggle` | a row\'s switch is flipped | `(integration: I, enabled: boolean)` |\n| `onRemove` | a row\'s remove button is chosen | `(integration: I)` |\n| `onAdd` | the add form is submitted | `(url: string)` |',
      },
    },
  },
  args: { ...integrationListPropsFactory(), onToggle: fn(), onRemove: fn(), onAdd: fn() },
  argTypes: {
    items: { control: 'object', description: '`{ id, name, detail, status, enabled, icon, account, connectAction }`.' },
    loading: { control: 'boolean', description: 'With `items` undefined: shows the loading line.' },
    intro: { control: 'text', description: 'Replaces the intro line; `null` hides it.' },
    labels: { control: 'object', description: 'Every string; `remove` and `toggle` are functions of the name.' },
    onToggle: { action: 'toggle' },
    onRemove: { action: 'remove' },
    onAdd: { action: 'add', description: 'May return a promise: the form is busy while it is pending.' },
  },
  decorators: [
    (Story) => (
      <div className="w-[520px] p-6">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<IntegrationListProps>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('switch', { name: 'Staging database' }));
    expect(args.onToggle).toHaveBeenCalledWith(expect.objectContaining({ id: 'i3' }), true);
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Docs search' }));
    expect(args.onRemove).toHaveBeenCalledWith(expect.objectContaining({ id: 'i1' }));
  },
};

/** Add by address: the button is disabled until there is text; the field clears once the add resolves. */
export const AddServer: Story = {
  render: () => <IntegrationListDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const add = canvas.getByRole('button', { name: 'Add server' });
    expect(add).toBeDisabled();
    const field = canvas.getByRole('textbox', { name: 'MCP server address' });
    await userEvent.type(field, 'https://tools.example.com/mcp');
    expect(add).toBeEnabled();
    await userEvent.click(add);
    await waitFor(() => expect(canvas.getByText('tools.example.com')).toBeInTheDocument(), { timeout: 3000 });
    expect(field).toHaveValue('');
  },
};

export const Loading: Story = { args: integrationListVariants[1].args };
export const Empty: Story = { args: integrationListVariants[2].args };
export const ReadOnly: Story = { args: integrationListVariants[3].args };
export const OAuthAccounts: Story = { args: integrationListVariants[4].args };
