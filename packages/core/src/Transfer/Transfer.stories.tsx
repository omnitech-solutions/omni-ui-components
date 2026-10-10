import { Transfer, type TransferProps } from '@oc-tech/omni-ui-components/Transfer';
import type { Meta, StoryObj } from '@storybook/react';
import {
  SAMPLE_MOVE_ICONS,
  SAMPLE_TRANSFER_LABELS,
  type TeamItem,
  transferPropsFactory,
} from 'factories/omni-ui-components/Transfer/Transfer.factories';
import * as React from 'react';
import { expect, userEvent, within } from 'storybook/test';

type TeamTransferProps = TransferProps<TeamItem>;

/** Holds `targetKeys` like a consumer does, and prints the value so a story can assert it. */
const Renderer: React.FC<TeamTransferProps> = (args) => {
  const [targetKeys, setTargetKeys] = React.useState(
    args.targetKeys ?? args.defaultTargetKeys ?? [],
  );
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-2">
      <Transfer<TeamItem>
        {...args}
        defaultTargetKeys={undefined}
        targetKeys={targetKeys}
        onChange={(next, moved, direction) => {
          setTargetKeys(next);
          args.onChange?.(next, moved, direction);
        }}
      />
      <output data-testid="value" className="text-xs text-[var(--oui-foreground-muted)]">
        {targetKeys.join(', ') || 'none'}
      </output>
    </div>
  );
};

const meta: Meta<TeamTransferProps> = {
  title: 'omni-ui-components/Transfer',
  component: Transfer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '<primary>Dual-list transfer</primary>: a source and a target listbox with move buttons between them. The value is `targetKeys`, in the order items were moved. Each list is one tab stop: the arrow keys move the active row, Space selects it, Ctrl or Cmd + A selects all, Enter moves the selection across. `TransferPrimitive` is the bare control; `Transfer` adds the <primary>label, description and error</primary>.',
      },
    },
  },
  args: transferPropsFactory(),
  argTypes: {
    layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    onChange: { action: 'changed' },
  },
  render: (args) => <Renderer {...args} />,
};
export default meta;

type Story = StoryObj<TeamTransferProps>;

export const Default: Story = {};

export const EmptyTarget: Story = { args: { defaultTargetKeys: [] } };

export const Searchable: Story = { args: { searchable: true } };

export const OneWay: Story = {
  args: { oneWay: true, defaultTargetKeys: ['engineering', 'finance'] },
};

export const Disabled: Story = { args: { disabled: true } };

export const ReadOnly: Story = { args: { readOnly: true } };

export const Required: Story = { args: { required: true, defaultTargetKeys: [] } };

export const WithError: Story = {
  args: { required: true, defaultTargetKeys: [], error: 'Give at least one team access' },
};

export const ListHeight: Story = { args: { listHeight: 120 } };

export const CustomLabelsAndIcons: Story = {
  args: { ...SAMPLE_MOVE_ICONS, labels: SAMPLE_TRANSFER_LABELS, searchable: true },
};

/** Operated by keyboard only: select two rows, move them across, then move everything back. */
export const Keyboard: Story = {
  args: { id: 'transfer-keyboard', defaultTargetKeys: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const source = canvas.getByRole('listbox', { name: 'All teams' });
    const target = canvas.getByRole('listbox', { name: 'With access' });
    await userEvent.tab();
    await expect(source).toHaveFocus();
    await userEvent.keyboard(' {ArrowDown} ');
    await expect(within(source).getAllByRole('option', { selected: true })).toHaveLength(2);
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByTestId('value')).toHaveTextContent('finance, engineering');
    await expect(within(target).getAllByRole('option')).toHaveLength(2);
    // Nothing is selected any more, so both move buttons are disabled and Tab goes straight to the target list.
    await userEvent.tab();
    await expect(target).toHaveFocus();
    await userEvent.keyboard('{Control>}a{/Control}{Enter}');
    await expect(canvas.getByTestId('value')).toHaveTextContent('none');
  },
};
