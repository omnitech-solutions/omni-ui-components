import * as React from 'react';
import { Archive, ChevronDown, Download, FileText, History, Link, Maximize2, Pencil, Pin, Settings, SquarePen, Trash2, X } from 'lucide-react';

import { ConversationHeader } from '@oc-tech/omni-ui-components/ConversationHeader';
import type { ConversationHeaderAction, ConversationHeaderProps, ConversationMenuItem } from '@oc-tech/omni-ui-components/ConversationHeader';
import type { ConversationItem } from '@oc-tech/omni-ui-components/ConversationList';
import type { Variant } from '../../internal/support/makeFactory';

/** The conversation menu of the original header: Rename, Pin, Share, Export, Archive, Delete (danger, separated). */
export const SAMPLE_CONVERSATION: ConversationItem = { id: 'c1', title: 'Two Sum with a hash map' };

export const conversationMenuItems = (onChoose: (id: string) => void = () => undefined): ConversationMenuItem[] => [
  { id: 'rename', label: 'Rename', icon: <Pencil />, startsRename: true, onClick: () => onChoose('rename') },
  { id: 'pin', label: 'Pin', icon: <Pin />, onClick: () => onChoose('pin') },
  { id: 'share', label: 'Share read-only link', icon: <Link />, separated: true, onClick: () => onChoose('share') },
  { id: 'export-md', label: 'Export as Markdown', icon: <Download />, separated: true, onClick: () => onChoose('export-md') },
  { id: 'export-pdf', label: 'Export as PDF', icon: <FileText />, onClick: () => onChoose('export-pdf') },
  { id: 'archive', label: 'Archive', icon: <Archive />, separated: true, onClick: () => onChoose('archive') },
  { id: 'delete', label: 'Delete', icon: <Trash2 />, danger: true, onClick: () => onChoose('delete') },
];

/** New chat, expand, settings and close (close shows its shortcut in the tooltip). */
export const headerActions = (onChoose: (key: string) => void = () => undefined): ConversationHeaderAction[] => [
  { key: 'new', label: 'New chat', shortcut: '⌘ ⇧ O', icon: <SquarePen />, onClick: () => onChoose('new') },
  { key: 'expand', label: 'Expand to full page', icon: <Maximize2 />, onClick: () => onChoose('expand') },
  { key: 'settings', label: 'Settings', icon: <Settings />, onClick: () => onChoose('settings') },
  { key: 'close', label: 'Close', shortcut: '⌘ J', icon: <X />, onClick: () => onChoose('close') },
];

/** Build `<ConversationHeader>` props for standalone stories and tests. */
export const conversationHeaderPropsFactory = (overrides: Partial<ConversationHeaderProps> = {}): ConversationHeaderProps => ({
  conversation: SAMPLE_CONVERSATION,
  menuIcon: <ChevronDown />,
  menuItems: conversationMenuItems(),
  onRename: () => undefined,
  onHistoryToggle: () => undefined,
  historyIcon: <History />,
  historyShortcut: '⌘ K',
  actions: headerActions(),
  ...overrides,
});

export const conversationHeaderVariants: Variant<ConversationHeaderProps>[] = [
  { name: 'Side panel (history, menu, actions)', args: {} },
  { name: 'New conversation (no menu)', args: { conversation: undefined, menuItems: [] } },
  { name: 'Plain title (no menu)', args: { menuItems: [] } },
  { name: 'Renaming', args: { renaming: true } },
  { name: 'Full page (no history or close)', args: { onHistoryToggle: undefined, actions: headerActions().filter((a) => a.key !== 'close' && a.key !== 'new') } },
  { name: 'With model control', args: { modelControl: <span className="rounded-full border px-2.5 py-1 text-xs">Claude Sonnet · High</span> } },
];

/** A working header: Rename in the menu opens the inline field and the title updates on commit. */
export const ConversationHeaderDemo: React.FC<{ onAction?: (name: string, ...args: unknown[]) => void }> = ({ onAction }) => {
  const [conversation, setConversation] = React.useState<ConversationItem>(SAMPLE_CONVERSATION);
  return (
    <div className="w-full">
      <ConversationHeader
        {...conversationHeaderPropsFactory({
          conversation,
          onRename: (current, next) => {
            setConversation({ ...current, title: next });
            onAction?.('rename', next);
          },
          menuItems: conversationMenuItems((id) => onAction?.('menu', id)),
          actions: headerActions((key) => onAction?.('action', key)),
        })}
      />
    </div>
  );
};
