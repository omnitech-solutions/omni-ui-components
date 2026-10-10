import { cn } from 'lib/utils';
import * as React from 'react';
import { ActionMenu, type ActionMenuSection } from '../ActionMenu';
import type { ConversationItem } from '../ConversationList/ConversationList.types';
import { IconAction } from '../internal/support/IconAction';
import { useControllableState } from '../lib/use-controllable-state';
import { Toolbar } from '../Toolbar';
import type {
  ConversationHeaderAction,
  ConversationHeaderLabels,
  ConversationHeaderProps,
  ConversationMenuItem,
} from './ConversationHeader.types';

/** English defaults of every string. Pass `labels` to translate any of them. */
export const DEFAULT_CONVERSATION_HEADER_LABELS: ConversationHeaderLabels = {
  toolbar: 'Conversation',
  untitled: 'New conversation',
  renameField: 'Conversation title',
  menu: 'Conversation menu',
  history: 'Conversations',
};

/** How long after the field opens a blur without a target is treated as the closing menu returning focus. */
const RENAME_SETTLE_MS = 400;

const Actions = <A extends ConversationHeaderAction<A>>({ actions }: { actions: A[] }) => (
  <>
    {actions
      .filter((action) => action.visible !== false)
      .map((action) => (
        <IconAction
          key={action.key}
          data-action={action.key}
          icon={action.icon}
          label={action.label}
          shortcut={action.shortcut}
          disabled={action.disabled}
          onClick={() => void action.onClick(action)}
        />
      ))}
  </>
);

/** Split the flat menu rows into ActionMenu sections wherever a row asks for a divider. */
const toSections = <M extends ConversationMenuItem<M>>(
  items: M[],
  onRename: (item: M) => void,
): ActionMenuSection[] => {
  const sections: ActionMenuSection[] = [];
  items.forEach((item, index) => {
    if (index === 0 || item.separated)
      sections.push({
        id: `section-${sections.length}`,
        selection: 'none',
        divider: index > 0,
        items: [],
      });
    sections[sections.length - 1].items.push({
      id: item.id,
      label: item.label,
      icon: item.icon,
      tone: item.danger ? 'danger' : 'default',
      disabled: item.disabled,
      onSelect: () => {
        void item.onClick?.(item);
        if (item.startsRename) onRename(item);
      },
    });
  });
  return sections;
};

/**
 * Omni ConversationHeader: the bar above a conversation. Leading buttons (history), the title as a menu button
 * (the library ActionMenu, rows from `menuItems` with `danger` and `separated`), inline rename (max 256, select-all on
 * open, Enter or blur commits, Escape cancels), the model control and the trailing icon buttons (new chat, expand,
 * settings, close with its shortcut in the tooltip). Everything is a prop; icons are caller nodes.
 *
 * Slots: `data-slot="conversation-header" | "conversation-title" | "conversation-rename"`.
 *
 * @example
 * <ConversationHeader title={thread.title} onRename={rename} menuIcon={<ChevronDown />}
 *   menuItems={[{ id: 'rename', label: 'Rename', startsRename: true }, { id: 'delete', label: 'Delete', danger: true, separated: true, onClick: remove }]}
 *   actions={[{ key: 'close', label: 'Close', shortcut: '⌘ J', icon: <X />, onClick: close }]} />
 */
export const ConversationHeader = <
  C extends ConversationItem = ConversationItem,
  M extends ConversationMenuItem<M> = ConversationMenuItem,
  A extends ConversationHeaderAction<A> = ConversationHeaderAction,
>({
  conversation,
  menuItems = [],
  menuIcon,
  onRename,
  onRenameStart,
  onRenameCancel,
  maxLength = 256,
  renaming: renamingProp,
  onHistoryToggle,
  historyIcon,
  historyShortcut,
  leading,
  modelControl,
  actions = [],
  trailing,
  labels: labelOverrides,
  className,
  'data-testid': testId,
}: ConversationHeaderProps<C, M, A>) => {
  const title = conversation?.title;
  const labels = { ...DEFAULT_CONVERSATION_HEADER_LABELS, ...labelOverrides };
  const [renamingState, setRenaming] = useControllableState(renamingProp, false);
  const renaming = renamingState && Boolean(onRename) && Boolean(title);
  const [draft, setDraft] = React.useState('');
  const input = React.useRef<HTMLInputElement>(null);
  const cancelled = React.useRef(false);
  const openedAt = React.useRef(0);

  // Opening the field fills it with the current title and selects it, so typing replaces it.
  React.useEffect(() => {
    if (!renaming) return;
    cancelled.current = false;
    openedAt.current = performance.now();
    setDraft(title ?? '');
    requestAnimationFrame(() => {
      // The field takes focus where it is: a page that shows a header already renaming must not jump to it.
      input.current?.focus({ preventScroll: true });
      input.current?.select();
    });
  }, [renaming, title]);

  const commit = () => {
    if (cancelled.current) return;
    // One commit per open: Enter unmounts the field and the blur that follows must not commit again.
    cancelled.current = true;
    const next = draft.trim();
    setRenaming(false);
    if (next && next !== title && conversation) void onRename?.(conversation, next);
  };

  // A row without a callback is not rendered: it needs `onClick`, or `startsRename` with a rename handler.
  const rows = menuItems.filter((item) => item.onClick || (item.startsRename && onRename));
  const hasMenu = Boolean(title) && rows.length > 0;
  const titleText = title || labels.untitled;
  const titleClass =
    'inline-flex h-8 min-w-0 max-w-full items-center gap-1 rounded-lg px-2 text-[13.5px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring/50';

  const renameField = renaming ? (
    <input
      ref={input}
      data-slot="conversation-rename"
      aria-label={labels.renameField}
      value={draft}
      maxLength={maxLength}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') commit();
        if (event.key === 'Escape') {
          cancelled.current = true;
          setRenaming(false);
          if (conversation) onRenameCancel?.(conversation);
        }
      }}
      onBlur={(event) => {
        // The menu that opened this field hands focus back to its (now gone) trigger as it closes; that stray blur
        // must not commit. Within the first moments after opening, take focus back instead.
        if (performance.now() - openedAt.current < RENAME_SETTLE_MS && !event.relatedTarget) {
          input.current?.focus({ preventScroll: true });
          return;
        }
        commit();
      }}
      className="h-8 w-full min-w-40 rounded-lg border border-solid border-[color:var(--oui-tone-accent-border)] bg-[color:var(--oui-panel-bg)] px-2 text-[13.5px] font-semibold outline-none focus:ring-2 focus:ring-ring/50"
    />
  ) : null;

  const titleButton = hasMenu ? (
    <ActionMenu
      label={labels.menu}
      width={240}
      align="start"
      sections={toSections(rows, () => {
        setRenaming(true);
        if (conversation) onRenameStart?.(conversation);
      })}
      trigger={
        <button
          type="button"
          data-slot="conversation-title"
          aria-haspopup="menu"
          className={cn(titleClass, 'hover:bg-[color:var(--oui-tone-neutral-bg)]')}
        >
          <span className="truncate">{titleText}</span>
          {menuIcon ? (
            <span
              aria-hidden="true"
              className="flex-none text-[color:var(--oui-panel-meta-fg)] [&_svg]:size-4"
            >
              {menuIcon}
            </span>
          ) : null}
        </button>
      }
    />
  ) : (
    <span data-slot="conversation-title" className={cn(titleClass, 'truncate')}>
      {titleText}
    </span>
  );

  const titleNode = (
    <>
      <span className={renaming ? 'hidden' : 'contents'}>{titleButton}</span>
      {renameField}
    </>
  );

  return (
    <Toolbar
      label={labels.toolbar}
      variant="bar"
      separators={false}
      className={cn(
        'flex-nowrap px-2 py-1.5 [&>[data-group-id=trailing]]:min-w-0 [&>[data-group-id=trailing]]:flex-[0_1_auto] [&>[data-group-id=trailing]]:flex-nowrap',
        className,
      )}
      data-testid={testId}
      leading={
        <div data-slot="conversation-header" className="flex min-w-0 flex-1 items-center gap-1">
          {onHistoryToggle ? (
            <IconAction
              data-action="history"
              icon={historyIcon}
              label={labels.history}
              shortcut={historyShortcut}
              onClick={() => onHistoryToggle()}
            />
          ) : null}
          {leading}
          {titleNode}
        </div>
      }
      trailing={
        <>
          {modelControl ? (
            <div
              data-slot="conversation-model"
              className="mr-2 min-w-0 shrink [&>*]:block [&>*]:max-w-full [&>*]:min-w-0 [&>*]:overflow-hidden [&>*]:text-ellipsis [&>*]:whitespace-nowrap [&_button]:max-w-full [&_button]:min-w-0 [&_button]:overflow-hidden [&_button]:text-ellipsis [&_button]:whitespace-nowrap"
            >
              {modelControl}
            </div>
          ) : null}
          <div
            data-slot="conversation-actions"
            className="flex flex-none items-center gap-[var(--oui-control-gap)]"
          >
            <Actions actions={actions} />
            {trailing}
          </div>
        </>
      }
    />
  );
};
