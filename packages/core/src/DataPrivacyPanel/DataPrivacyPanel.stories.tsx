import {
  DataPrivacyPanel,
  type DataPrivacyPanelProps,
} from '@oc-tech/omni-ui-components/DataPrivacyPanel';
import type { Meta, StoryObj } from '@storybook/react';
import {
  DataPrivacyPanelDemo,
  dataPrivacyPanelPropsFactory,
  dataPrivacyPanelVariants,
} from 'factories/omni-ui-components/DataPrivacyPanel/DataPrivacyPanel.factories';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { exampleDocs } from 'storybook-helpers/internal/support/exampleDocs';
import exampleSource from './DataPrivacyPanel.factories.tsx?raw';

const meta: Meta<DataPrivacyPanelProps> = {
  title: 'omni-ui-components/DataPrivacyPanel',
  component: DataPrivacyPanel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'What is kept, for how long, and taking it away: a <primary>retention Segmented</primary>, an <primary>activity log</primary> you View or Hide (capped at <primary>220px</primary>, scrolls), <primary>Export all data</primary>, and <primary>Delete everything</primary> behind the library <primary>Popconfirm</primary> (replacing the original two-click confirmation). Each section appears only when its callback is given.\n\n<primary>Callbacks</primary> (every callback is optional; a control that exists only for a callback is not rendered when it is absent):\n\n| Callback | Fires when | Payload |\n| --- | --- | --- |\n| `onRetentionChange` | a retention choice is made (controlled or not) | `(value: string)` |\n| `onShowActivityChange` | View log / Hide log is chosen (controlled or not) | `(open: boolean)` |\n| `onExport` | Export is chosen | `()` |\n| `onDeleteAll` | Delete everything is confirmed in the Popconfirm | `()` |',
      },
    },
  },
  args: {
    ...dataPrivacyPanelPropsFactory(),
    onRetentionChange: fn(),
    onShowActivityChange: fn(),
    onExport: fn(),
    onDeleteAll: fn(),
  },
  argTypes: {
    retention: {
      control: 'text',
      description: 'Current retention value (`forever`, `90d`, `30d` by default).',
    },
    retentionOptions: { control: 'object', description: '`{ value, label }[]`.' },
    activity: { control: 'object', description: 'Log rows `{ id?, summary, context?, at }`.' },
    activityOpen: { control: 'boolean' },
    activityLoading: { control: 'boolean' },
    labels: { control: 'object', description: 'Every string.' },
    onRetentionChange: { action: 'retention' },
    onShowActivityChange: { action: 'activity open' },
    onExport: { action: 'export' },
    onDeleteAll: {
      action: 'delete all',
      description: 'Called only after the Popconfirm is confirmed.',
    },
    formatDate: {
      control: false,
      description: 'Date text of a log row. Default `toLocaleString`.',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[560px] p-6">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<DataPrivacyPanelProps>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Export' }));
    expect(args.onExport).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('radio', { name: '90 days' }));
    expect(args.onRetentionChange).toHaveBeenCalledWith('90d');
  },
};

/** Delete asks first: nothing is deleted until the Popconfirm is confirmed. */
export const DeleteNeedsConfirmation: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Delete all' }));
    expect(args.onDeleteAll).not.toHaveBeenCalled();
    const body = within(document.body);
    expect(await body.findByText('Delete everything?')).toBeInTheDocument();
    await userEvent.click(body.getByRole('button', { name: 'Yes, delete all' }));
    expect(args.onDeleteAll).toHaveBeenCalledTimes(1);
  },
};

/** View log loads rows (here after a click); Hide log removes them. */
export const ActivityLog: Story = {
  render: () => <DataPrivacyPanelDemo />,
  parameters: exampleDocs(exampleSource, 'DataPrivacyPanelDemo'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'View log' }));
    const list = await canvas.findByRole('list', { name: 'Activity log' });
    expect(list).toHaveClass('max-h-[220px]');
    await userEvent.click(canvas.getByRole('button', { name: 'Hide log' }));
    await waitFor(() =>
      expect(canvas.queryByRole('list', { name: 'Activity log' })).not.toBeInTheDocument(),
    );
  },
};

export const LogOpen: Story = { args: dataPrivacyPanelVariants[1].args };
export const LogScrolls: Story = { args: dataPrivacyPanelVariants[2].args };
export const LogEmpty: Story = { args: dataPrivacyPanelVariants[3].args };
export const LogLoading: Story = { args: dataPrivacyPanelVariants[4].args };
export const RetentionOnly: Story = { args: dataPrivacyPanelVariants[5].args };
