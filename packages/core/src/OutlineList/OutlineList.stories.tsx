import { OutlineList, type OutlineListProps } from '@oc-tech/omni-ui-components/OutlineList';
import type { Meta, StoryObj } from '@storybook/react';
import {
  NextStepPanel,
  type Step,
  StepsEmpty,
  StepsInGerman,
  StepsLastFirst,
  StepsLiveOnShow,
  StepsPanel,
  StepsReadOnly,
  StepsWithCustomRows,
  StepsWithTags,
} from 'factories/omni-ui-components/OutlineList/OutlineList.factories';
import type * as React from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { exampleDocs } from 'storybook-helpers/internal/support/sourceSnippet';
import factories from './OutlineList.factories.tsx?raw';

type StoryArgs = Partial<OutlineListProps<Step>>;

const meta: Meta<StoryArgs> = {
  title: 'omni-ui-components/OutlineList',
  component: OutlineList as unknown as React.ComponentType<StoryArgs>,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      description: {
        component:
          'A <primary>numbered list of things to jump to</primary>: the steps of a guide, the sections of a page. Each row is one button with a label that wraps, a quiet `meta` line and an optional `trailing` node (a `Tag`, a `Badge`). The chosen row (`value` or `defaultValue`) carries a bar and `aria-current`; the row with `state: "live"` is green, so what is happening now and what is being read never look alike. `order="reversed"` draws the last item first and keeps the numbers of the order given. The list is one tab stop: arrow keys move between rows, Home and End go to the ends. <primary>onValueChange(item)</primary> receives the full item by reference: <code>OutlineList&lt;T extends OutlineItem&gt;</code>. Without it the rows are not pressable. `renderItem(item, state, select)` draws a row in place of the default, and the row itself is exported as <primary>OutlineListItem</primary>, usable without the list. Strings come from `labels` (`list`, `live`); the list is named by `aria-label`, else `labels.list`. It is built from the library\'s own parts: `List` and `ListItem` hold the rows, `useRovingTabindex` moves between them (as in `ConversationList`) and `useControllableState` keeps the choice. It is the rows only and is meant to be placed inside a `Panel`, which gives it its `title`, `meta` and `scroll`. Every story below shows its whole code: a `Step` type that extends `OutlineItem`, the typed data, the state and the callback.',
      },
    },
  },
  argTypes: {
    items: { control: false, description: '`T[]`, where `T extends OutlineItem`.' },
    value: { control: false, description: 'The id of the item on show (controlled).' },
    defaultValue: { control: false, description: 'The id on show at first (uncontrolled).' },
    onValueChange: {
      control: false,
      description: '`(item: T) => void`. Without it the rows are not pressable.',
    },
    order: { control: false, description: '`as-given` (default) or `reversed`.' },
    renderItem: {
      control: false,
      description: '`(item: T, state: OutlineRowState, select: () => void) => ReactNode`.',
    },
    empty: { control: false, description: 'Shown in place of the rows when there are none.' },
    labels: { control: false, description: '{ list, live }.' },
  },
};
export default meta;
type Story = StoryObj<StoryArgs>;

/** Pressing a row chooses it: the bar and `aria-current` move, and the panel's `meta` reads the step's own `href`. */
export const Default: Story = {
  render: () => <StepsPanel />,
  parameters: exampleDocs(factories, 'StepsPanel'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Steps' })).toBeVisible();
    const first = canvas.getByRole('button', { name: /Install/ });
    await expect(canvas.getByRole('button', { name: /Configure/ })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await userEvent.click(first);
    await expect(first).toHaveAttribute('aria-current', 'true');
    await expect(canvas.getByText('/docs/install')).toBeVisible();
  },
};

/** One tab stop for the list; arrow keys, Home and End move the focus between rows without choosing one. */
export const KeyboardMovement: Story = {
  render: () => <StepsPanel />,
  parameters: exampleDocs(factories, 'StepsPanel'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rows = canvas.getAllByRole('button');
    await expect(rows.filter((row) => row.tabIndex === 0)).toHaveLength(1);
    rows[0]?.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(rows[1]).toHaveFocus();
    await expect(rows[1]).toHaveAttribute('tabindex', '0');
    await userEvent.keyboard('{End}');
    await expect(rows[rows.length - 1]).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(rows[rows.length - 1]).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(rows[0]).toHaveFocus();
    await expect(canvas.getByText('/docs/configure')).toBeVisible();
  },
};

/** Uncontrolled and reversed: `defaultValue` is the first choice, and the numbers keep the order given. */
export const Reversed: Story = {
  render: () => <StepsLastFirst />,
  parameters: exampleDocs(factories, 'StepsLastFirst'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('button')[0]).toHaveTextContent('4Deploy');
    await userEvent.click(canvas.getByRole('button', { name: /Configure/ }));
    await expect(canvas.getByText('last first · /docs/configure')).toBeVisible();
  },
};

export const LiveIsChosen: Story = {
  render: () => <StepsLiveOnShow />,
  parameters: exampleDocs(factories, 'StepsLiveOnShow'),
};

/** Without `onValueChange` the rows are plain: nothing to press, nothing in the tab order. */
export const ReadOnly: Story = {
  render: () => <StepsReadOnly />,
  parameters: exampleDocs(factories, 'StepsReadOnly'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button')).toBeNull();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(4);
  },
};

export const Empty: Story = {
  render: () => <StepsEmpty />,
  parameters: exampleDocs(factories, 'StepsEmpty'),
};

export const CustomLabels: Story = {
  render: () => <StepsInGerman />,
  parameters: exampleDocs(factories, 'StepsInGerman'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('list', { name: 'Schritte' })).toBeVisible();
    await expect(canvas.getByText('3 min · läuft')).toBeVisible();
  },
};

/** `trailing` on an item draws a node at the end of its row: here the library's `Tag`. */
export const TrailingTag: Story = {
  render: () => <StepsWithTags />,
  parameters: exampleDocs(factories, 'StepsWithTags'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('button', { name: /Configure/ });
    await expect(within(row).getByText('new')).toBeVisible();
    await userEvent.click(row);
    await expect(canvas.getByText('/docs/configure')).toBeVisible();
  },
};

/** `renderItem` returns the library's `OutlineListItem` with a class of its own; `select` still chooses the row. */
export const RenderItem: Story = {
  render: () => <StepsWithCustomRows />,
  parameters: exampleDocs(factories, 'StepsWithCustomRows'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const optional = canvas.getByRole('button', { name: /Build the project/ });
    await expect(optional).toHaveClass('italic');
    await userEvent.click(optional);
    await expect(optional).toHaveAttribute('aria-current', 'true');
    await expect(canvas.getByText('/docs/build')).toBeVisible();
  },
};

/** `OutlineListItem` on its own, outside a list: the caller passes `number` and `current`. */
export const ItemOnItsOwn: Story = {
  render: () => <NextStepPanel />,
  parameters: exampleDocs(factories, 'NextStepPanel'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('button', { name: /Configure/ });
    await expect(row).not.toHaveAttribute('aria-current');
    await userEvent.click(row);
    await expect(row).toHaveAttribute('aria-current', 'true');
    await expect(canvas.getByText('/docs/configure')).toBeVisible();
  },
};
