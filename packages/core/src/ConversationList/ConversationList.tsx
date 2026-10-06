import * as React from 'react';

import { cn } from 'lib/utils';
import { useControllableState } from '../lib/use-controllable-state';
import { IconAction } from '../internal/support/IconAction';
import { conversationListVariants, conversationRowVariants, ROW_ACTIONS_CLASS } from './ConversationList.variants';
import type { ConversationItem, ConversationListLabels, ConversationListProps, ConversationRowAction, PerItem } from './ConversationList.types';

/** English defaults of every string. Pass `labels` to translate any of them. */
export const DEFAULT_CONVERSATION_LIST_LABELS: ConversationListLabels = {
  title: 'Conversations',
  archivedTitle: 'Archived',
  newChat: 'New chat',
  back: 'Back',
  close: 'Close',
  searchPlaceholder: 'Search conversations',
  noMatch: (query) => `No conversations match “${query}”`,
  none: 'No conversations yet',
  noneArchived: 'No archived conversations',
  archivedButton: (count) => `Archived · ${count}`,
};

const resolve = <T, R>(value: PerItem<T, R> | undefined, item: T): R | undefined =>
  typeof value === 'function' ? (value as (item: T) => R)(item) : value;

const RowAction = <T extends ConversationItem>({ action, item }: { action: ConversationRowAction<T>; item: T }) => {
  if (resolve(action.visible, item) === false) return null;
  const pressed = resolve(action.pressed, item);
  return (
    <IconAction
      data-action={action.key}
      icon={resolve(action.icon, item)}
      label={resolve(action.label, item) ?? action.key}
      pressed={pressed}
      className={cn('size-7', action.tone === 'danger' && 'hover:text-[color:var(--oui-tone-danger-fg)]')}
      onClick={() => void action.onClick(item)}
    />
  );
};

/**
 * Omni ConversationList: the sidebar of an assistant. Headed groups of rows (build them with `groupByRecency`), a
 * search field with a key hint, hover actions per row (`rowActions`: pin, delete, restore), an archived view and a
 * footer slot. Everything is a prop: the open row is `activeId` (it gets `aria-current`), rows report `onOpen(item)`,
 * every string is in `labels`, every icon is a caller node. The caller debounces `onSearchChange`.
 *
 * Slots for host styling: `data-slot="conversation-list" | "conversation-list-head" | "conversation-list-search" |
 * "conversation-list-body" | "conversation-group" | "conversation-row" | "conversation-list-empty" | "conversation-list-archived"`.
 *
 * @example
 * <ConversationList groups={groupByRecency(threads, new Date(), { pinned: (t) => t.pinned })} activeId={id}
 *   onOpen={open} onSearchChange={setQuery} searchShortcut="⌘K" onNewChat={create}
 *   rowActions={[{ key: 'pin', label: (t) => (t.pinned ? 'Unpin' : 'Pin'), icon: (t) => <Pin filled={t.pinned} />, pressed: (t) => !!t.pinned, onClick: togglePin }]} />
 */
export function ConversationList<T extends ConversationItem = ConversationItem>({
  groups,
  activeId,
  onOpen,
  rowActions = [],
  docked = true,
  onClose,
  onNewChat,
  newChatShortcut,
  query: queryProp,
  defaultQuery = '',
  onSearchChange,
  searchShortcut,
  searchRef,
  archived = false,
  onBack,
  archivedCount = 0,
  onShowArchived,
  empty,
  footer,
  icons,
  labels: labelOverrides,
  className,
  'data-testid': testId,
}: ConversationListProps<T>) {
  const labels = { ...DEFAULT_CONVERSATION_LIST_LABELS, ...labelOverrides };
  const headingId = React.useId();
  const [value, setValue] = useControllableState(queryProp, defaultQuery, onSearchChange);
  const visibleGroups = groups.filter((group) => group.items.length > 0);
  const showSearch = Boolean(onSearchChange) && !archived;

  const emptyMessage = archived ? labels.noneArchived : value.trim() ? labels.noMatch(value.trim()) : labels.none;

  return (
    <nav
      aria-label={labels.title}
      data-slot="conversation-list"
      data-docked={docked ? 'true' : 'false'}
      data-testid={testId}
      className={cn(conversationListVariants({ docked }), className)}
    >
      <div data-slot="conversation-list-head" className="flex flex-none items-center gap-1 px-3 pt-3 pb-2">
        <span id={headingId} className="flex-1 truncate text-[13px] font-semibold">
          {archived ? labels.archivedTitle : labels.title}
        </span>
        {archived ? (
          onBack ? <IconAction icon={icons?.back} label={labels.back} onClick={() => void onBack()} /> : null
        ) : onNewChat ? (
          <IconAction icon={icons?.newChat} label={labels.newChat} shortcut={newChatShortcut} onClick={() => void onNewChat()} />
        ) : null}
        {!docked && onClose ? <IconAction icon={icons?.close} label={labels.close} onClick={() => void onClose()} /> : null}
      </div>

      {showSearch ? (
        <div data-slot="conversation-list-search" className="flex-none px-2.5 pb-1.5">
          <label className="flex h-8 items-center gap-2 rounded-lg border border-solid border-[color:var(--oui-panel-border)] bg-[color:var(--oui-panel-bg)] px-2.5 text-[13px] focus-within:ring-2 focus-within:ring-ring/50">
            {icons?.search ? (
              <span aria-hidden="true" className="flex-none text-[color:var(--oui-panel-meta-fg)] [&_svg]:size-4">
                {icons.search}
              </span>
            ) : null}
            <input
              ref={searchRef}
              type="search"
              value={value}
              placeholder={labels.searchPlaceholder}
              aria-label={labels.searchPlaceholder}
              onChange={(event) => {
                setValue(event.target.value);
              }}
              className="min-w-0 flex-1 appearance-none bg-transparent outline-none placeholder:text-[color:var(--oui-panel-meta-fg)] [&::-webkit-search-cancel-button]:hidden"
            />
            {searchShortcut ? (
              <kbd aria-hidden="true" className="flex-none rounded border border-solid border-[color:var(--oui-panel-border)] px-1 font-mono text-[11px] text-[color:var(--oui-panel-meta-fg)]">
                {searchShortcut}
              </kbd>
            ) : null}
          </label>
        </div>
      ) : null}

      <div data-slot="conversation-list-body" className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {visibleGroups.map((group) => (
          <div key={group.key} role="group" aria-label={group.label} data-slot="conversation-group" data-group={group.key}>
            <div aria-hidden="true" className="px-2 pt-2.5 pb-1 text-[11px] font-medium tracking-wide text-[color:var(--oui-panel-meta-fg)]">
              {group.label}
            </div>
            {group.items.map((item) => (
              <div
                key={item.id}
                data-slot="conversation-row"
                aria-current={item.id === activeId ? 'true' : undefined}
                className={conversationRowVariants({ active: item.id === activeId })}
              >
                {onOpen ? (
                  <button
                    type="button"
                    onClick={() => void onOpen(item)}
                    className="min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-left text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    {item.title}
                  </button>
                ) : (
                  <span className="min-w-0 flex-1 truncate px-2 py-1.5 text-[13px]">{item.title}</span>
                )}
                {rowActions.length ? (
                  <span data-slot="conversation-row-actions" className={ROW_ACTIONS_CLASS}>
                    {rowActions.map((action) => (
                      <RowAction key={action.key} action={action} item={item} />
                    ))}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        ))}

        {visibleGroups.length === 0 ? (
          <div data-slot="conversation-list-empty" className="px-3 py-6 text-center text-[13px] text-[color:var(--oui-panel-meta-fg)]">
            {empty ?? emptyMessage}
          </div>
        ) : null}

        {!archived && onShowArchived ? (
          <button
            type="button"
            data-slot="conversation-list-archived"
            onClick={() => void onShowArchived()}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] text-[color:var(--oui-panel-meta-fg)] outline-none hover:bg-[color:var(--oui-tone-neutral-bg)] focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-4"
          >
            {icons?.archived}
            {labels.archivedButton(archivedCount)}
          </button>
        ) : null}
      </div>

      {footer ? <div data-slot="conversation-list-footer" className="flex-none border-t border-solid border-[color:var(--oui-panel-divider)]">{footer}</div> : null}
    </nav>
  );
}
