import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { CommandPopover, type CommandPopoverProps } from '@oc-tech/omni-ui-components/CommandPopover';
import { ComposerDemo } from 'factories/omni-ui-components/Composer/Composer.factories';
import { commandPopoverPropsFactory, surfaceItems } from 'factories/omni-ui-components/CommandPopover/CommandPopover.factories';

const meta: Meta<CommandPopoverProps> = {
  title: 'omni-ui-components/CommandPopover',
  component: CommandPopover,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The <primary>listbox</primary> a typed `/` or `@` opens above a composer (`role="listbox"`, `aria-selected` options, hover highlight, a hint line, <primary>Nothing matches</primary>). It is presentational: <primary>useCommandTrigger</primary> finds the trigger in the draft (`slashTrigger`: the whole draft is `/word`; `mentionTrigger`: `@query` after whitespace), resolves the rows (a sync array, or `source(query)` sync or async with stale answers dropped), and handles ArrowUp/ArrowDown, Enter or Tab to pick and Escape to close. Focus never leaves the textarea (`aria-activedescendant` points at the active row). `T` is your own item type (extend `CommandItem`): every callback hands back the same object.\n\n**Callbacks**\n\n| Prop | Fires when | Payload |\n| --- | --- | --- |\n| `onSelect` | a row is chosen (click) | `(item: T, index: number)` |\n| `onActiveChange` | the highlight moves (hover), controlled or not | `(index: number)` |\n| `onClose` | a press outside, or Escape inside, asks to close | none |\n| `useCommandTrigger onPick` | a row is picked (Enter, Tab or click) | `(item: T, { draft, query, match })` |\n| `useCommandTrigger onClose` | Escape (or `close()`) closes without a pick | none |\n| `useCommandTrigger onAfterPick` | after a pick, to refocus the textarea | none |\n',
      },
    },
  },
  args: commandPopoverPropsFactory({ onSelect: fn(), onActiveChange: fn() }),
  argTypes: {
    items: { control: 'object', description: '`CommandItem[]`: { id, label, description, icon }.' },
    activeIndex: { control: 'number', description: 'Highlighted row (`aria-selected`).' },
    label: { control: 'text', description: 'Accessible name of the listbox.' },
    title: { control: 'text', description: 'Visible heading.' },
    labelPrefix: { control: 'text', description: 'Text before each label, e.g. `/`.' },
    hint: { control: 'text', description: 'Footer hint line.' },
    hideWhenEmpty: { control: 'boolean', description: 'Render nothing when empty (slash). Off: show `labels.empty` (mentions).' },
    loading: { control: 'boolean', description: 'An async source is still answering.' },
    placement: { control: 'inline-radio', options: ['above', 'below'] },
    labels: { control: 'object', description: '{ empty, loading }.' },
    onSelect: { action: 'selected' },
    onActiveChange: { action: 'hovered' },
  },
  render: (args) => (
    <div className="p-6">
      <CommandPopover {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<CommandPopoverProps>;

/** The slash list with its hint. Hover moves the highlight; click picks. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const options = canvas.getAllByRole('option');
    await expect(options[0]).toHaveAttribute('aria-selected', 'true');
    await userEvent.hover(options[2]);
    await expect(args.onActiveChange).toHaveBeenCalledWith(2);
    await userEvent.click(options[1]);
    await expect(args.onSelect).toHaveBeenCalled();
  },
};

/** `@` mentions: icon, name and description, no prefix and no hint. */
export const Mentions: Story = { args: { items: surfaceItems(), label: 'Add from Studio', title: 'Add from Studio', labelPrefix: undefined, hint: undefined, activeIndex: 1 } };

/** No rows: `Nothing matches`. */
export const NothingMatches: Story = { args: { items: [], label: 'Add from Studio', title: 'Add from Studio', labelPrefix: undefined, hint: undefined } };

/** An async source still answering with nothing to list yet. */
export const Loading: Story = { args: { items: [], loading: true, label: 'Add from Studio', title: 'Add from Studio', labelPrefix: undefined, hint: undefined } };

/**
 * In a composer: type `/` for commands (filtered by prefix as you type), `@` for an async list of surfaces. ArrowDown/Up move,
 * Enter or Tab pick, Escape closes without stopping a run; focus stays in the textarea.
 */
export const InComposer: StoryObj = {
  render: () => (
    <div className="max-w-md px-6 pt-72 pb-6">
      <ComposerDemo attachments={false} dictation={false} onAction={fn()} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('combobox', { name: 'Message' });
    await userEvent.type(box, '/');
    const list = await canvas.findByRole('listbox', { name: 'Commands' });
    await expect(within(list).getAllByRole('option')).toHaveLength(4);
    await userEvent.type(box, 'm');
    // Clicking the box asked the popover to close; typing reopens it as a new element.
    await waitFor(() => expect(within(canvas.getByRole('listbox', { name: 'Commands' })).getAllByRole('option')).toHaveLength(1));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('listbox')).toBeNull());
    await expect(box).toHaveFocus();
    await userEvent.clear(box);
    await userEvent.type(box, 'Look at @');
    const mentions = await canvas.findByRole('listbox', { name: 'Add from Studio' });
    await waitFor(() => expect(within(mentions).getAllByRole('option').length).toBe(4));
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(canvas.queryByRole('listbox')).toBeNull());
    await expect(box).toHaveValue('Look at ');
    await expect(canvas.getByRole('group', { name: 'Code' })).toBeVisible();
  },
};
