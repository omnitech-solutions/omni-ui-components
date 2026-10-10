import {
  CommandPopover,
  type CommandPopoverProps,
} from '@oc-tech/omni-ui-components/CommandPopover';
import type { Meta, StoryObj } from '@storybook/react';
import {
  CommandPalette as CommandPaletteExample,
  commandPopoverPropsFactory,
  surfaceItems,
} from 'factories/omni-ui-components/CommandPopover/CommandPopover.factories';
import { ComposerDemo } from 'factories/omni-ui-components/Composer/Composer.factories';
import * as React from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { exampleDocs } from 'storybook-helpers/internal/support/exampleDocs';
import factoriesSource from './CommandPopover.factories.tsx?raw';
import exampleSource from './CommandPopover.stories.tsx?raw';

const meta: Meta<CommandPopoverProps> = {
  title: 'omni-ui-components/CommandPopover',
  component: CommandPopover,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The <primary>listbox</primary> a typed `/` or `@` opens above a composer (`role="listbox"`, `aria-selected` options, hover highlight, a hint line, <primary>Nothing matches</primary>). It is presentational: <primary>useCommandTrigger</primary> finds the trigger in the draft (`slashTrigger`: the whole draft is `/word`; `mentionTrigger`: `@query` after whitespace), resolves the rows (a sync array, or `source(query)` sync or async with stale answers dropped), and handles ArrowUp/ArrowDown, Enter or Tab to pick and Escape to close. Focus never leaves the textarea (`aria-activedescendant` points at the active row). `T` is your own item type (extend `CommandItem`): every callback hands back the same object.\n\n**Callbacks**\n\n| Prop | Fires when | Payload |\n| --- | --- | --- |\n| `onSelect` | a row is chosen (click) | `(item: T, index: number)` |\n| `onActiveChange` | the highlight moves (hover), controlled or not | `(index: number)` |\n| `onClose` | a press outside, or Escape inside, asks to close | none |\n| `useCommandTrigger onPick` | a row is picked (Enter, Tab or click) | `(item: T, { draft, query, match })` |\n| `useCommandTrigger onClose` | Escape (or `close()`) closes without a pick | none |\n| `useCommandTrigger onAfterPick` | after a pick, to refocus the textarea | none |\n| `search.onChange` | the query of the popover\'s own input changes | `(query: string)` |\n\n<primary>A command palette</primary> is the same part with `search` and `placement="inline"` inside a `Modal`: the popover draws its own input (a combobox named by `search.label`) that owns the arrows, Home, End, Enter and Escape, filters by label (`filter` replaces the test, `filter={false}` leaves it to the host), draws rows under their `group` heading in first-seen order and each row\'s `shortcut` keys at its end.\n',
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
    hideWhenEmpty: {
      control: 'boolean',
      description: 'Render nothing when empty (slash). Off: show `labels.empty` (mentions).',
    },
    loading: { control: 'boolean', description: 'An async source is still answering.' },
    placement: { control: 'inline-radio', options: ['above', 'below', 'inline'] },
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
export const Mentions: Story = {
  args: {
    items: surfaceItems(),
    label: 'Add from Studio',
    title: 'Add from Studio',
    labelPrefix: undefined,
    hint: undefined,
    activeIndex: 1,
  },
};

/** No rows: `Nothing matches`. */
export const NothingMatches: Story = {
  args: {
    items: [],
    label: 'Add from Studio',
    title: 'Add from Studio',
    labelPrefix: undefined,
    hint: undefined,
  },
};

/** An async source still answering with nothing to list yet. */
export const Loading: Story = {
  args: {
    items: [],
    loading: true,
    label: 'Add from Studio',
    title: 'Add from Studio',
    labelPrefix: undefined,
    hint: undefined,
  },
};

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
    // The popover renders in a portal on body, so its queries use the whole page.
    const page = within(document.body);
    const box = canvas.getByRole('textbox', { name: 'Message' });
    await userEvent.type(box, '/');
    const list = await page.findByRole('listbox', { name: 'Commands' });
    await expect(within(list).getAllByRole('option')).toHaveLength(4);
    await userEvent.type(box, 'm');
    // Clicking the box asked the popover to close; typing reopens it as a new element.
    await waitFor(() =>
      expect(
        within(page.getByRole('listbox', { name: 'Commands' })).getAllByRole('option'),
      ).toHaveLength(1),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('listbox')).toBeNull());
    await expect(box).toHaveFocus();
    await userEvent.clear(box);
    await userEvent.type(box, 'Look at @');
    const mentions = await page.findByRole('listbox', { name: 'Add from Studio' });
    await waitFor(() => expect(within(mentions).getAllByRole('option').length).toBe(4));
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(page.queryByRole('listbox')).toBeNull());
    await expect(box).toHaveValue('Look at ');
    await expect(canvas.getByRole('group', { name: 'Code' })).toBeVisible();
  },
};

const ClippedDemo: React.FC = () => {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  return (
    <div className="p-6">
      {/* The clip: overflow hidden and short, like the Panel dock. The anchored popover must still show above it. */}
      <div
        data-testid="clip"
        className="overflow-hidden rounded-xl border p-3"
        style={{ height: 70, marginTop: 220 }}
      >
        <div ref={setAnchor} data-slot="composer" className="rounded-lg border p-2 text-sm">
          Composer (inside an overflow-hidden container)
        </div>
        <CommandPopover {...commandPopoverPropsFactory({ className: '' })} anchor={anchor} />
      </div>
    </div>
  );
};

/**
 * With `anchor` the popover renders in a portal on `document.body`, fixed above the anchor, so an `overflow: hidden`
 * ancestor (the Panel dock) cannot clip it. Listbox and `aria-selected` semantics are unchanged.
 */
export const NotClippedInPortal: StoryObj = {
  render: () => <ClippedDemo />,
  parameters: exampleDocs(exampleSource, 'ClippedDemo'),
  play: async ({ canvasElement }) => {
    const clip = within(canvasElement).getByTestId('clip');
    const popover = document.querySelector('[data-slot="command-popover"]') as HTMLElement;
    await expect(clip.contains(popover)).toBe(false);
    await expect(popover.parentElement).toBe(document.body);
    const rect = popover.getBoundingClientRect();
    const clipRect = clip.getBoundingClientRect();
    // It sits above the clipped box and is fully visible (not cut to the 70px clip).
    await expect(rect.bottom).toBeLessThanOrEqual(clipRect.top + 20);
    await expect(rect.height).toBeGreaterThan(100);
    await expect(within(popover).getAllByRole('option')[0]).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};

const onRun = fn();

/** A palette in a `Modal`: `search`, groups, shortcut keys and the empty text. Type, arrow, Enter. */
export const CommandPalette: StoryObj = {
  render: () => <CommandPaletteExample onRun={onRun} />,
  parameters: exampleDocs(factoriesSource, 'CommandPalette'),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    onRun.mockClear();
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open commands' }));
    const input = await page.findByRole('combobox', { name: 'Search commands' });
    await waitFor(() => expect(input).toHaveFocus());
    await expect(page.getByRole('group', { name: 'Navigate' })).toBeInTheDocument();
    await userEvent.type(input, 'zzz');
    await expect(page.getByRole('status')).toHaveTextContent('No command matches');
    await userEvent.clear(input);
    await userEvent.type(input, 'go to');
    await expect(page.getAllByRole('option')).toHaveLength(2);
    await userEvent.keyboard('{ArrowDown}');
    const people = page.getByRole('option', { name: /Go to People/ });
    await expect(people).toHaveAttribute('aria-selected', 'true');
    await expect(input).toHaveAttribute('aria-activedescendant', people.id);
    await userEvent.keyboard('{Enter}');
    await expect(onRun).toHaveBeenCalledWith(expect.objectContaining({ id: 'people' }));
    await waitFor(() => expect(page.queryByRole('combobox')).not.toBeInTheDocument());
  },
};
