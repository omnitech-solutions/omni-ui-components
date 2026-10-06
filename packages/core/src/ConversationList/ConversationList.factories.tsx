import * as React from 'react';
import { Archive, ArchiveRestore, ChevronLeft, Pin, Search, Settings, SquarePen, Trash2, X } from 'lucide-react';

import { ConversationList, ConversationListFooter } from '@oc-tech/omni-ui-components/ConversationList';
import type { ConversationItem, ConversationListProps, ConversationRowAction } from '@oc-tech/omni-ui-components/ConversationList';
import { groupByRecency } from '@oc-tech/omni-ui-components/lib/chat';
import type { Variant } from '../../internal/support/makeFactory';

/** A fixed "now" so the recency groups (and stories, tests) never depend on the real clock. */
export const SAMPLE_NOW = new Date('2026-10-06T12:00:00');
const ago = (days: number, hours = 0) => new Date(SAMPLE_NOW.getTime() - days * 86_400_000 - hours * 3_600_000).toISOString();

export interface SampleConversation extends ConversationItem {
  updatedAt: string;
}

export const sampleConversations = (): SampleConversation[] => [
  { id: 'c1', title: 'Two Sum with a hash map', updatedAt: ago(0, 1) },
  { id: 'c2', title: 'Explain closures in 60 seconds', updatedAt: ago(0, 3) },
  { id: 'c3', title: 'Design a rate limiter', pinned: true, updatedAt: ago(9) },
  { id: 'c4', title: 'Debounce vs throttle', updatedAt: ago(3) },
  { id: 'c5', title: 'STAR story: the outage', updatedAt: ago(20) },
  { id: 'c6', title: 'Event loop and microtasks', updatedAt: ago(70) },
];

export const conversationIcons: NonNullable<ConversationListProps['icons']> = {
  search: <Search />,
  newChat: <SquarePen />,
  back: <ChevronLeft />,
  close: <X />,
  archived: <Archive />,
};

/** Pin / Unpin (filled when pinned) and Delete: the hover actions of the original sidebar. */
export const conversationRowActions = (
  handlers: { onPin?: (item: SampleConversation) => void | Promise<void>; onDelete?: (item: SampleConversation) => void | Promise<void> } = {},
): ConversationRowAction<SampleConversation>[] => [
  {
    key: 'pin',
    label: (item) => (item.pinned ? 'Unpin' : 'Pin'),
    icon: (item) => <Pin className={item.pinned ? 'fill-current' : undefined} />,
    pressed: (item) => Boolean(item.pinned),
    onClick: (item) => handlers.onPin?.(item),
  },
  { key: 'delete', label: 'Delete', icon: <Trash2 />, tone: 'danger', onClick: (item) => handlers.onDelete?.(item) },
];

/** Restore and Delete: the actions of the archived view. */
export const archivedRowActions = (handlers: { onRestore?: (item: SampleConversation) => void | Promise<void>; onDelete?: (item: SampleConversation) => void | Promise<void> } = {}) => [
  { key: 'restore', label: 'Restore', icon: <ArchiveRestore />, onClick: (item: SampleConversation) => handlers.onRestore?.(item) },
  { key: 'delete', label: 'Delete', icon: <Trash2 />, tone: 'danger' as const, onClick: (item: SampleConversation) => handlers.onDelete?.(item) },
];

export const sampleFooter = (onOpenSettings?: () => void) => (
  <ConversationListFooter user={{ name: 'Desmond O’Leary', detail: 'Pro plan' }} onOpenSettings={onOpenSettings} settingsIcon={<Settings />} />
);

/** Build `<ConversationList>` props for standalone stories and tests. */
export const conversationListPropsFactory = (overrides: Partial<ConversationListProps<SampleConversation>> = {}): ConversationListProps<SampleConversation> => ({
  groups: groupByRecency(sampleConversations(), SAMPLE_NOW, { pinned: (item) => Boolean(item.pinned) }),
  activeId: 'c1',
  onOpen: () => undefined,
  icons: conversationIcons,
  rowActions: conversationRowActions(),
  onNewChat: () => undefined,
  newChatShortcut: '⌘ ⇧ O',
  onSearchChange: () => undefined,
  searchShortcut: '⌘K',
  onShowArchived: () => undefined,
  archivedCount: 2,
  footer: sampleFooter(() => undefined),
  ...overrides,
});

export const conversationListVariants: Variant<ConversationListProps<SampleConversation>>[] = [
  { name: 'Docked, grouped by recency', args: {} },
  { name: 'Overlay (side-panel mode)', args: { docked: false, onClose: () => undefined } },
  { name: 'Archived view', args: { archived: true, onBack: () => undefined, rowActions: archivedRowActions(), groups: groupByRecency(sampleConversations().slice(4), SAMPLE_NOW) } },
  { name: 'No conversations', args: { groups: [], activeId: undefined } },
  { name: 'No search match', args: { groups: [], query: 'kubernetes' } },
  { name: 'No archived', args: { archived: true, groups: [], onBack: () => undefined } },
];

/**
 * A working list: search filters the rows (the caller would debounce a server query), Pin toggles, Delete removes,
 * the archived button swaps to an archived view. All state is here; the component takes props.
 */
export const ConversationListDemo: React.FC<{ onAction?: (name: string, ...args: unknown[]) => void }> = ({ onAction }) => {
  const [items, setItems] = React.useState(sampleConversations());
  const [archivedItems, setArchivedItems] = React.useState(sampleConversations().slice(4).map((item) => ({ ...item, id: `a-${item.id}` })));
  const [query, setQuery] = React.useState('');
  const [archived, setArchived] = React.useState(false);
  const [active, setActive] = React.useState('c1');
  const source = archived ? archivedItems : items;
  const shown = source.filter((item) => item.title.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div className="h-[460px] w-[280px]">
      <ConversationList
        {...conversationListPropsFactory({
          groups: groupByRecency(shown, SAMPLE_NOW, { pinned: archived ? undefined : (item) => Boolean(item.pinned) }),
          activeId: active,
          query,
          onSearchChange: setQuery,
          archived,
          archivedCount: archivedItems.length,
          onShowArchived: () => setArchived(true),
          onBack: () => setArchived(false),
          onOpen: (item) => {
            setActive(item.id);
            onAction?.('open', item.id);
          },
          rowActions: archived
            ? archivedRowActions({
                onRestore: (item) => {
                  setArchivedItems((list) => list.filter((entry) => entry.id !== item.id));
                  setItems((list) => [{ ...item, id: `r-${item.id}`, updatedAt: SAMPLE_NOW.toISOString() }, ...list]);
                  onAction?.('restore', item.id);
                },
                onDelete: (item) => setArchivedItems((list) => list.filter((entry) => entry.id !== item.id)),
              })
            : conversationRowActions({
                onPin: (item) => {
                  setItems((list) => list.map((entry) => (entry.id === item.id ? { ...entry, pinned: !entry.pinned } : entry)));
                  onAction?.('pin', item.id);
                },
                onDelete: (item) => {
                  setItems((list) => list.filter((entry) => entry.id !== item.id));
                  onAction?.('delete', item.id);
                },
              }),
        })}
      />
    </div>
  );
};
