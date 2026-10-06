import * as React from 'react';

import { PanelShell } from '@oc-tech/omni-ui-components/PanelShell';
import type { PanelShellProps } from '@oc-tech/omni-ui-components/PanelShell';
import { Button } from '@oc-tech/omni-ui-components/Button';
import { ConversationHeader } from '@oc-tech/omni-ui-components/ConversationHeader';
import { ConversationList } from '@oc-tech/omni-ui-components/ConversationList';
import { EmptyStarters } from '@oc-tech/omni-ui-components/EmptyStarters';
import { SettingsDialog } from '@oc-tech/omni-ui-components/SettingsDialog';
import { Toast, useToast, type ToastItem } from '@oc-tech/omni-ui-components/Toast';
import { Transcript } from '@oc-tech/omni-ui-components/Transcript';
import { conversationHeaderPropsFactory, conversationMenuItems, headerActions } from 'factories/omni-ui-components/ConversationHeader/ConversationHeader.factories';
import {
  archivedRowActions,
  conversationListPropsFactory,
  conversationRowActions,
  SAMPLE_NOW,
  sampleConversations,
  sampleFooter,
} from 'factories/omni-ui-components/ConversationList/ConversationList.factories';
import { sampleStarters } from 'factories/omni-ui-components/EmptyStarters/EmptyStarters.factories';
import { ModelPickerDemo } from 'factories/omni-ui-components/ModelPicker/ModelPicker.factories';
import { sampleSettingsTabs, settingsDialogPropsFactory } from 'factories/omni-ui-components/SettingsDialog/SettingsDialog.factories';
import { answeredEntries, ComposerExample, transcriptPropsFactory } from 'factories/omni-ui-components/Transcript/Transcript.factories';
import { groupByRecency } from '@oc-tech/omni-ui-components/lib/chat';
import type { Variant } from '../../internal/support/makeFactory';

/** Build `<PanelShell>` props for standalone stories and tests. */
export const panelShellPropsFactory = (overrides: Partial<PanelShellProps> = {}): PanelShellProps => ({
  mode: 'panel',
  open: true,
  ...overrides,
});

const HostPage: React.FC = () => (
  <div className="flex h-full flex-1 flex-col gap-2 rounded-[14px] border border-dashed p-5 text-sm text-muted-foreground">
    <strong className="text-foreground">Host page</strong>
    The product the assistant sits beside. It is hidden while the assistant is full page.
  </div>
);

interface ShellToast extends ToastItem {
  undo?: () => void;
}

export const panelShellVariants: Variant<PanelShellProps>[] = [
  { name: 'Side panel (440px) beside the host', args: { host: <HostPage />, children: <EmptyStarters title="What are we working on?" starters={sampleStarters()} onStart={() => undefined} columns={1} /> } },
  { name: 'Full page (host hidden)', args: { mode: 'full', host: <HostPage />, children: <EmptyStarters title="What are we working on?" starters={sampleStarters()} onStart={() => undefined} /> } },
  { name: 'Closed (host only)', args: { open: false, host: <HostPage /> } },
  { name: 'Narrow panel (320px)', args: { width: 320, host: <HostPage />, children: <EmptyStarters title="Ask anything" onStart={() => undefined} /> } },
];

/**
 * The whole shell together: ConversationList (docked in full mode, overlay in panel mode), ConversationHeader with
 * the model picker, a Transcript or the EmptyStarters, the composer, a SettingsDialog and a Toast with Undo.
 * Everything is composed from the library parts; all state is here.
 */
export const ChatShellDemo: React.FC<{ mode?: 'panel' | 'full'; empty?: boolean; onAction?: (name: string, ...args: unknown[]) => void }> = ({
  mode: initialMode = 'panel',
  empty: initialEmpty = false,
  onAction,
}) => {
  const [mode, setMode] = React.useState(initialMode);
  const [open, setOpen] = React.useState(true);
  const [history, setHistory] = React.useState(false);
  const [settings, setSettings] = React.useState(false);
  const [items, setItems] = React.useState(sampleConversations());
  const [archived, setArchived] = React.useState<typeof items>([]);
  const [showArchived, setShowArchived] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [activeId, setActiveId] = React.useState<string | undefined>(initialEmpty ? undefined : 'c1');
  const [titles, setTitles] = React.useState<Record<string, string>>({});
  const toast = useToast<ShellToast>({ position: 'absolute' });

  const list = (showArchived ? archived : items).filter((item) => item.title.toLowerCase().includes(query.trim().toLowerCase()));
  const active = [...items, ...archived].find((item) => item.id === activeId);
  const full = mode === 'full';

  const remove = (id: string) => {
    const gone = items.find((item) => item.id === id);
    setItems((current) => current.filter((item) => item.id !== id));
    if (activeId === id) setActiveId(undefined);
    if (gone) toast.notify({ text: 'Conversation deleted', actionLabel: 'Undo', undo: () => setItems((current) => [gone, ...current]) });
  };

  const sidebar = (
    <ConversationList
      {...conversationListPropsFactory({
        groups: groupByRecency(list, SAMPLE_NOW, { pinned: showArchived ? undefined : (item) => Boolean(item.pinned) }),
        activeId,
        docked: full,
        onClose: () => setHistory(false),
        query,
        onSearchChange: setQuery,
        archived: showArchived,
        archivedCount: archived.length,
        onShowArchived: () => setShowArchived(true),
        onBack: () => setShowArchived(false),
        onNewChat: () => {
          setActiveId(undefined);
          setHistory(false);
        },
        onOpen: (item) => {
          setActiveId(item.id);
          setHistory(false);
          onAction?.('open', item.id);
        },
        rowActions: showArchived
          ? archivedRowActions({
              onRestore: (item) => {
                setArchived((current) => current.filter((entry) => entry.id !== item.id));
                setItems((current) => [item, ...current]);
              },
            })
          : conversationRowActions({
              onPin: (item) => setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, pinned: !entry.pinned } : entry))),
              onDelete: (item) => remove(item.id),
            }),
        footer: sampleFooter(() => setSettings(true)),
      })}
    />
  );

  const header = (
    <ConversationHeader
      {...conversationHeaderPropsFactory({
        conversation: active ? { ...active, title: titles[active.id] ?? active.title } : undefined,
        onRename: (current, next) => setTitles((all) => ({ ...all, [current.id]: next })),
        menuItems: active
          ? conversationMenuItems((id) => {
              if (id === 'delete') remove(active.id);
              if (id === 'archive') {
                setItems((current) => current.filter((item) => item.id !== active.id));
                setArchived((current) => [active, ...current]);
                setActiveId(undefined);
                toast.notify({ text: 'Conversation archived', actionLabel: 'Undo', undo: () => undefined });
              }
            })
          : [],
        onHistoryToggle: full ? undefined : () => setHistory((open) => !open),
        modelControl: <ModelPickerDemo side="bottom" align="end" onAction={onAction} />,
        actions: headerActions((key) => {
          if (key === 'expand') setMode(full ? 'panel' : 'full');
          if (key === 'settings') setSettings(true);
          if (key === 'close') setOpen(false);
          if (key === 'new') setActiveId(undefined);
        })
          .filter((action) => !(full && (action.key === 'close' || action.key === 'new' || action.key === 'settings')))
          .map((action) => (action.key === 'expand' && full ? { ...action, label: 'Back to side panel' } : action)),
      })}
    />
  );

  return (
    <div className="h-full w-full">
      <PanelShell
        mode={mode}
        open={open}
        onOpenChange={setOpen}
        host={
          <div className="flex h-full flex-1 flex-col items-start gap-3 rounded-[14px] border border-dashed p-5 text-sm text-muted-foreground">
            <strong className="text-foreground">Host page</strong>
            <Button variant="outline" buttonSize="sm" onClick={() => setOpen(true)}>
              Open assistant
            </Button>
          </div>
        }
        sidebar={sidebar}
        sidebarMode={full ? 'docked' : 'overlay'}
        sidebarOpen={history}
        onSidebarOpenChange={setHistory}
        header={header}
        footer={
          <div className="p-2.5">
            <ComposerExample onAction={onAction} />
          </div>
        }
        overlay={<Toast {...toast.props} onAction={(item) => item.undo?.()} />}
      >
        {active ? (
          <div className="p-3">
            <Transcript {...transcriptPropsFactory({ entries: answeredEntries() })} />
          </div>
        ) : (
          <EmptyStarters title="What are we working on?" description="Ask anything, or pick a starter." starters={sampleStarters()} columns={full ? 2 : 1} onStart={(prompt) => onAction?.('start', prompt)} />
        )}
      </PanelShell>
      <SettingsDialog {...settingsDialogPropsFactory({ open: settings, onClose: () => setSettings(false), tabs: sampleSettingsTabs(onAction) })} />
    </div>
  );
};
