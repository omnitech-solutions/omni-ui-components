import { QueuedList, type QueuedListProps } from '@oc-tech/omni-ui-components/QueuedList';
import type { Meta, StoryObj } from '@storybook/react';
import { queuedListPropsFactory } from 'factories/omni-ui-components/QueuedList/QueuedList.factories';
import { expect, fn, userEvent, within } from 'storybook/test';

const meta: Meta<QueuedListProps> = {
  title: 'omni-ui-components/QueuedList',
  component: QueuedList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The <primary>Queued</primary> rows above a composer: messages sent while a reply is running, flushed in order when it ends. Each row is an icon node, the `Queued` label, the truncated text and a remove button (`onRemove(id)`). Renders nothing when `items` is empty. Strings come from `labels`. `T` is your own item type (extend `QueuedItem`): `onRemove` hands back the same object.\n\n**Callbacks**\n\n| Prop | Fires when | Payload |\n| --- | --- | --- |\n| `onRemove` | a row’s remove button is chosen | `(item: T)`, the same object from `items` |\n',
      },
    },
  },
  args: queuedListPropsFactory({ onRemove: fn() }),
  argTypes: {
    items: { control: 'object', description: '`{ id, text }[]`.' },
    onRemove: {
      action: 'removed',
      description: 'Called with the full item. Without it rows have no remove button.',
    },
    labels: { control: 'object', description: '{ queued, remove, list }.' },
  },
  render: (args) => (
    <div className="max-w-md p-6">
      <QueuedList {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<QueuedListProps>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('list', { name: 'Queued messages' })).toBeVisible();
    await userEvent.click(canvas.getAllByRole('button', { name: 'Remove from queue' })[0]);
    await expect(args.onRemove).toHaveBeenCalledWith(args.items[0]);
  },
};

export const ReadOnly: Story = { args: { onRemove: undefined } };
export const Empty: Story = { args: { items: [] } };
