import type { OutlineListProps } from '@oc-tech/omni-ui-components/OutlineList';
import type { Meta, StoryObj } from '@storybook/react';
import {
  OutlineListDemo,
  type OutlineQuestion,
} from 'factories/omni-ui-components/OutlineList/OutlineList.factories';
import type * as React from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

type StoryArgs = Partial<OutlineListProps<OutlineQuestion>> & {
  readOnly?: boolean;
  onAction?: (name: string, detail?: unknown) => void;
};

const meta: Meta<StoryArgs> = {
  title: 'omni-ui-components/OutlineList',
  component: OutlineListDemo as unknown as React.ComponentType<StoryArgs>,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A <primary>numbered list of things to jump to</primary>: the questions of a call, the steps of a run. Each row is one button with a label that wraps and a quiet `meta` line. The chosen row (`value` or `defaultValue`) carries a bar and `aria-current`; the row with `state: "live"` is green, so what is happening now and what is being read never look alike. `order="reversed"` draws the newest first and keeps the numbers of the order given. Arrow keys move between rows, Home and End go to the ends. <primary>onValueChange(item)</primary> receives the full item by reference: <code>OutlineList&lt;T extends OutlineItem&gt;</code>. Without it the rows are not pressable. Strings come from `labels` (`list`, `live`).',
      },
    },
  },
  argTypes: {
    order: { control: 'inline-radio', options: ['as-given', 'reversed'] },
    title: { control: 'text', description: 'Header text; also the accessible name of the list.' },
    hint: { control: 'text', description: 'Quiet text at the end of the header.' },
    empty: { control: 'text', description: 'Shown in place of the rows when there are none.' },
    labels: { control: 'object', description: '{ list, live }.' },
    readOnly: { control: 'boolean', description: 'Story-only: leaves `onValueChange` out.' },
    onAction: { action: 'outline', description: 'Story-only: reports onValueChange.' },
  },
  render: (args) => (
    <div className="w-[280px] rounded-xl border border-solid border-[color:var(--oui-panel-border)] bg-[color:var(--oui-panel-bg)]">
      <OutlineListDemo {...args} />
    </div>
  ),
};
export default meta;
type Story = StoryObj<StoryArgs>;

/** Pressing a row chooses it: the bar and `aria-current` move, and the item is reported. */
export const Default: Story = {
  args: { onAction: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('button', { name: 'Tell me about yourself' });
    await expect(canvas.getByRole('button', { name: 'Microservice or monolith?' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await userEvent.click(first);
    await expect(first).toHaveAttribute('aria-current', 'true');
    await expect(args.onAction).toHaveBeenCalledWith(
      'value',
      expect.objectContaining({ id: 'q1', askedAt: '11:32' }),
    );
  },
};

/** Arrow keys, Home and End move the focus between rows without choosing one. */
export const KeyboardMovement: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rows = canvas.getAllByRole('button');
    rows[0]?.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(rows[1]).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(rows[rows.length - 1]).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(rows[0]).toHaveFocus();
  },
};

export const InOrderGiven: Story = { args: { order: 'as-given', hint: 'oldest first' } };
export const LiveIsChosen: Story = { args: { defaultValue: 'q4' } };
/** Without `onValueChange` the rows are plain: nothing to press, nothing in the tab order. */
export const ReadOnly: Story = {
  args: { readOnly: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button')).toBeNull();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(4);
  },
};
export const Empty: Story = {
  args: { items: [], hint: undefined, empty: 'Questions appear here as they are asked.' },
};
export const NoHeader: Story = { args: { title: undefined, hint: undefined } };
export const CustomLabels: Story = {
  args: { title: undefined, hint: undefined, labels: { list: 'Fragen', live: 'läuft' } },
};
