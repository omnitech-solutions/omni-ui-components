import '@testing-library/jest-dom';

import {
  ConversationHeader,
  type ConversationHeaderAction,
  type ConversationMenuItem,
} from '@oc-tech/omni-ui-components/ConversationHeader';
import {
  type ConversationItem,
  ConversationList,
  type ConversationRowAction,
} from '@oc-tech/omni-ui-components/ConversationList';
import { EmptyStarters, type StarterItem } from '@oc-tech/omni-ui-components/EmptyStarters';
import { type IntegrationItem, IntegrationList } from '@oc-tech/omni-ui-components/IntegrationList';
import { groupByRecency } from '@oc-tech/omni-ui-components/lib/chat';
import { type MemoryItem, PreferencesForm } from '@oc-tech/omni-ui-components/PreferencesForm';
import { SettingsDialog, type SettingsTab } from '@oc-tech/omni-ui-components/SettingsDialog';
import { type ShortcutItem, ShortcutList } from '@oc-tech/omni-ui-components/ShortcutList';
import { Toast, type ToastItem } from '@oc-tech/omni-ui-components/Toast';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Every item type below is extended with a field the library does not know. Each callback must hand back the very
// same object (toBe), and the extra field must be visible to TypeScript inside the callback (compile-time check).

interface Chat extends ConversationItem {
  updatedAt: string;
  workspace: string;
}
interface Menu extends ConversationMenuItem<Menu> {
  analytics: string;
}
interface Act extends ConversationHeaderAction<Act> {
  analytics: string;
}
interface Starter extends StarterItem {
  tag: string;
}
interface Integration extends IntegrationItem {
  scopes: string[];
}
interface Memory extends MemoryItem {
  source: string;
}
interface Tab extends SettingsTab<Tab> {
  badge: number;
}
interface Shortcut extends ShortcutItem {
  group: string;
}
interface Note extends ToastItem {
  undo: string;
}

const chat: Chat = { id: 'c1', title: 'One', updatedAt: new Date().toISOString(), workspace: 'w1' };

describe('callbacks receive the full item, by reference', () => {
  it('groupByRecency keeps the same item objects', () => {
    const groups = groupByRecency([chat], new Date(), {});
    expect(groups[0].items[0]).toBe(chat);
  });

  it('ConversationList: onOpen and row actions', async () => {
    const seen: Chat[] = [];
    const actions: ConversationRowAction<Chat>[] = [
      {
        key: 'x',
        label: 'Act',
        onClick: (conversation) => {
          // compile-time: `workspace` is visible
          seen.push(conversation);
          void conversation.workspace;
        },
      },
    ];
    render(
      <ConversationList<Chat>
        groups={[{ key: 'today', label: 'Today', items: [chat] }]}
        onOpen={(conversation) => {
          seen.push(conversation);
          void conversation.workspace;
        }}
        rowActions={actions}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'One' }));
    await userEvent.click(screen.getByRole('button', { name: 'Act' }));
    expect(seen[0]).toBe(chat);
    expect(seen[1]).toBe(chat);
  });

  it('ConversationHeader: menu item, action, rename and rename lifecycle', async () => {
    const menu: Menu = {
      id: 'm',
      label: 'Pick',
      analytics: 'a',
      onClick: (item) => void item.analytics,
    };
    const onMenu = jest.fn((item: Menu) => void item.analytics);
    menu.onClick = onMenu;
    const act: Act = {
      key: 'a',
      label: 'Do',
      analytics: 'b',
      onClick: (action) => void action.analytics,
    };
    const onAct = jest.fn((action: Act) => void action.analytics);
    act.onClick = onAct;
    const rename: Menu = { id: 'r', label: 'Rename', analytics: 'c', startsRename: true };
    const onRename = jest.fn(
      (conversation: Chat, title: string) => void (conversation.workspace + title),
    );
    const onStart = jest.fn((conversation: Chat) => void conversation.workspace);
    const onCancel = jest.fn((conversation: Chat) => void conversation.workspace);
    render(
      <ConversationHeader<Chat, Menu, Act>
        conversation={chat}
        menuItems={[rename, menu]}
        actions={[act]}
        onRename={onRename}
        onRenameStart={onStart}
        onRenameCancel={onCancel}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Do' }));
    expect(onAct.mock.calls[0][0]).toBe(act);
    await userEvent.click(screen.getByRole('button', { name: /One/ }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Pick' }));
    expect(onMenu.mock.calls[0][0]).toBe(menu);
    await userEvent.click(screen.getByRole('button', { name: /One/ }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Rename' }));
    expect(onStart.mock.calls[0][0]).toBe(chat);
    await screen.findByRole('textbox', { name: 'Conversation title' });
    await userEvent.keyboard('Two{Enter}');
    expect(onRename.mock.calls[0][0]).toBe(chat);
    expect(onRename.mock.calls[0][1]).toBe('Two');
    await userEvent.click(screen.getByRole('button', { name: /One/ }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Rename' }));
    await screen.findByRole('textbox', { name: 'Conversation title' });
    await userEvent.keyboard('{Escape}');
    expect(onCancel.mock.calls[0][0]).toBe(chat);
  });

  it('EmptyStarters: onStart gets the starter', async () => {
    const starter: Starter = { title: 'Go', prompt: 'p', tag: 't' };
    const onStart = jest.fn((s: Starter) => void s.tag);
    render(<EmptyStarters<Starter> title="T" starters={[starter]} onStart={onStart} />);
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(onStart.mock.calls[0][0]).toBe(starter);
  });

  it('IntegrationList: onToggle and onRemove get the integration', async () => {
    const integration: Integration = { id: 'i', name: 'Docs', enabled: false, scopes: ['read'] };
    const onToggle = jest.fn(
      (i: Integration, enabled: boolean) => void (i.scopes.length && enabled),
    );
    const onRemove = jest.fn((i: Integration) => void i.scopes);
    render(
      <IntegrationList<Integration>
        items={[integration]}
        onToggle={onToggle}
        onRemove={onRemove}
      />,
    );
    await userEvent.click(screen.getByRole('switch', { name: 'Docs' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove Docs' }));
    expect(onToggle.mock.calls[0][0]).toBe(integration);
    expect(onToggle.mock.calls[0][1]).toBe(true);
    expect(onRemove.mock.calls[0][0]).toBe(integration);
  });

  it('PreferencesForm: onForget gets the memory', async () => {
    const memory: Memory = { id: 'm', text: 'Likes tests', source: 'chat' };
    const onForget = jest.fn((m: Memory) => void m.source);
    render(<PreferencesForm<Memory> instructions="" memories={[memory]} onForget={onForget} />);
    await userEvent.click(screen.getByRole('button', { name: /Forget/ }));
    expect(onForget.mock.calls[0][0]).toBe(memory);
  });

  it('SettingsDialog: onTabChange and render get the tab', async () => {
    const rendered: Tab[] = [];
    const a: Tab = {
      id: 'a',
      label: 'A',
      badge: 1,
      render: (tab) => (rendered.push(tab), void tab.badge, (<span>panel a</span>)),
    };
    const b: Tab = {
      id: 'b',
      label: 'B',
      badge: 2,
      render: (tab) => <span>panel b {tab.badge}</span>,
    };
    const onTabChange = jest.fn((tab: Tab) => void tab.badge);
    render(
      <SettingsDialog<Tab>
        open
        tabs={[a, b]}
        onTabChange={onTabChange}
        onClose={() => undefined}
      />,
    );
    expect(rendered[0]).toBe(a);
    await userEvent.click(screen.getByRole('tab', { name: 'B' }));
    expect(onTabChange.mock.calls[0][0]).toBe(b);
    expect(within(screen.getByRole('tabpanel')).getByText('panel b 2')).toBeInTheDocument();
  });

  it('Toast: onAction gets the toast item', async () => {
    const toast: Note = { text: 'Hi', actionLabel: 'Undo', undo: 'u' };
    const onAction = jest.fn((t: Note) => void t.undo);
    render(<Toast<Note> toast={toast} duration={0} onAction={onAction} />);
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onAction.mock.calls[0][0]).toBe(toast);
  });

  it('ShortcutList is generic over its items', () => {
    const item: Shortcut = { label: 'Search', keys: ['K'], group: 'nav' };
    render(<ShortcutList<Shortcut> items={[item]} />);
    expect(screen.getByText('Search')).toBeInTheDocument();
  });
});
