import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Check, CircleAlert } from 'lucide-react';

import { cn } from 'lib/utils';
import type { ActionMenuHint, ActionMenuItem, ActionMenuNotice, ActionMenuProps, ActionMenuSection } from './ActionMenu.types';

const SURFACE =
  'z-50 box-border flex flex-col overflow-hidden rounded-xl border border-[color:var(--oui-tone-neutral-border)] bg-[var(--oui-surface-field)] p-1.5 text-[var(--oui-foreground)] shadow-xl outline-none font-[family-name:var(--oui-font-sans)]';
const ROW = 'relative box-border flex cursor-default select-none items-start gap-2 rounded-[7px] px-2.5 text-[13.5px] outline-none';
const ROW_INTERACTIVE =
  'transition-colors data-[highlighted]:bg-muted/50 data-[disabled]:cursor-not-allowed data-[disabled]:text-[var(--oui-foreground-muted)] data-[disabled]:opacity-70';
const CHECKED_TINT = 'bg-[color-mix(in_srgb,var(--oui-tone-accent-solid-bg)_10%,transparent)]';
const MONO = 'font-mono';

/** Distinct rule for the fixed leading column: a check mark, or the row's icon, or empty space of the same width. */
const hasLeadingColumn = (items: ActionMenuItem[]) => items.some((item) => item.checked !== undefined || item.icon !== undefined);

const resolveSelection = (section: ActionMenuSection): 'single' | 'multiple' | 'none' =>
  section.selection ?? (section.items.some((item) => item.checked !== undefined) ? 'single' : 'none');

/** Fold a section's controlled `value` into per-row `checked`. */
const withValue = (section: ActionMenuSection): ActionMenuSection =>
  section.value === undefined
    ? section
    : { ...section, selection: section.selection ?? 'single', items: section.items.map((item) => ({ ...item, checked: item.id === section.value })) };

const cssLength = (value: number | string | undefined) => (typeof value === 'number' ? `${value}px` : value);

/** The inside of one row: leading column, label (+ description or reason), shortcut. */
const RowBody: React.FC<{ item: ActionMenuItem; column: boolean }> = ({ item, column }) => {
  const second = item.disabledReason ?? item.description;
  return (
    <>
      {column ? (
        <span
          data-slot="action-menu-column"
          aria-hidden="true"
          className={cn(
            'mt-px flex size-[17px] shrink-0 items-center justify-center [&_svg]:size-[17px]',
            item.checked === undefined ? 'text-current' : 'text-[color:var(--oui-tone-accent-fg)]',
          )}
        >
          {item.checked ? <Check data-slot="action-menu-check" /> : item.icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 leading-[1.35]">
        <span className={cn('block truncate', second ? 'font-medium' : '')}>{item.label}</span>
        {second ? (
          <span data-slot="action-menu-description" className="block text-[12px] font-normal text-[var(--oui-foreground-muted)]">
            {second}
          </span>
        ) : null}
      </span>
      {item.shortcut?.length ? (
        <span data-slot="action-menu-shortcut" className={cn('ml-auto shrink-0 pl-3 pt-px text-[11.5px] text-[var(--oui-foreground-muted)]', MONO)}>
          {item.shortcut.join('')}
        </span>
      ) : null}
    </>
  );
};

const rowTone = (item: ActionMenuItem) => (item.tone === 'danger' ? 'text-[color:var(--oui-tone-danger-fg)]' : '');

const SectionLabel: React.FC<{ section: ActionMenuSection }> = ({ section }) =>
  section.label ? (
    <DropdownMenuPrimitive.Label
      data-slot="action-menu-label"
      className={cn(
        'px-2.5 text-[var(--oui-foreground-muted)]',
        section.labelStyle === 'caps' ? 'pt-2 pb-[3px] text-[11px] uppercase tracking-[0.05em]' : 'pt-1.5 pb-1 text-[11.5px]',
      )}
    >
      {section.label}
    </DropdownMenuPrimitive.Label>
  ) : null;

const sectionHasDivider = (section: ActionMenuSection, index: number) =>
  index > 0 && (section.divider ?? !(section.labelStyle === 'caps' && section.label));

const Divider: React.FC = () => (
  <div role="separator" data-slot="action-menu-divider" className="mx-1.5 my-1 h-px bg-[color:var(--oui-tone-neutral-border)]" />
);

const NoticeBlock: React.FC<{
  notice: ActionMenuNotice;
  interactive: boolean;
  onAction: () => void;
}> = ({ notice, interactive, onAction }) => {
  const tone = notice.tone;
  const action = notice.action;
  const actionClass =
    'flex h-[26px] shrink-0 cursor-pointer items-center rounded-[7px] px-[9px] text-[12px] outline-none transition-colors hover:brightness-125 data-[highlighted]:brightness-125 focus-visible:ring-2 focus-visible:ring-ring/50';
  const actionStyle = {
    color: `var(--oui-tone-${tone}-fg)`,
    background: `color-mix(in srgb, var(--oui-tone-${tone}-solid-bg) 22%, transparent)`,
  } as React.CSSProperties;
  return (
    <div
      data-slot="action-menu-notice"
      data-tone={tone}
      role={interactive ? undefined : 'status'}
      className="mx-0.5 mt-0.5 mb-1.5 flex items-start gap-2 rounded-[9px] border px-2.5 py-[9px]"
      style={{
        color: `var(--oui-tone-${tone}-fg)`,
        background: `var(--oui-tone-${tone}-bg)`,
        borderColor: `color-mix(in srgb, var(--oui-tone-${tone}-border) 65%, transparent)`,
      }}
    >
      <span aria-hidden="true" className="mt-px flex size-[17px] shrink-0 items-center justify-center [&_svg]:size-[17px]">
        {notice.icon ?? <CircleAlert />}
      </span>
      <span className="min-w-0 flex-1 leading-[1.35]">
        <span className="block text-[13px] font-medium">{notice.title}</span>
        {notice.detail ? (
          <span
            className="block text-[12px]"
            style={{
              color: `color-mix(in srgb, var(--oui-tone-${tone}-fg) 55%, var(--oui-foreground))`,
            }}
          >
            {notice.detail}
          </span>
        ) : null}
      </span>
      {action ? (
        interactive ? (
          <DropdownMenuPrimitive.Item data-slot="action-menu-notice-action" className={actionClass} style={actionStyle} onSelect={onAction}>
            {action.label}
          </DropdownMenuPrimitive.Item>
        ) : (
          <button type="button" data-slot="action-menu-notice-action" className={actionClass} style={actionStyle} onClick={onAction}>
            {action.label}
          </button>
        )
      ) : null}
    </div>
  );
};

const HintRow: React.FC<{ hint: ActionMenuHint }> = ({ hint }) => (
  <div
    data-slot="action-menu-hint"
    className="mx-1.5 mt-1 flex shrink-0 items-center justify-between gap-3 border-t border-[color:var(--oui-tone-neutral-border)] px-1 pt-[7px] pb-[3px] text-[11.5px] text-[var(--oui-foreground-muted)]"
  >
    <span>{hint.label}</span>
    <span className={MONO}>{hint.keys.join(' ')}</span>
  </div>
);

const MenuSection: React.FC<{
  section: ActionMenuSection;
  index: number;
  onChoose: (item: ActionMenuItem) => void;
}> = ({ section, index, onChoose }) => {
  const selection = resolveSelection(section);
  const column = hasLeadingColumn(section.items);
  const highlight = section.highlightChecked ?? true;

  const rows = section.items.map((item) => {
    const inactive = item.disabled || Boolean(item.disabledReason);
    // 7px with a second line, 6px for a single line (the board's two row heights).
    const className = cn(
      ROW,
      item.description || item.disabledReason ? 'py-[7px]' : 'py-1.5',
      ROW_INTERACTIVE,
      rowTone(item),
      highlight && item.checked ? CHECKED_TINT : '',
    );
    const common = {
      'data-slot': 'action-menu-item',
      'data-item-id': item.id,
      'data-tone': item.tone,
      disabled: inactive || undefined,
      className,
      onSelect: () => onChoose(item),
    };
    const body = <RowBody item={item} column={column} />;
    if (selection === 'single') {
      return (
        <DropdownMenuPrimitive.RadioItem key={item.id} {...common} value={item.id}>
          {body}
        </DropdownMenuPrimitive.RadioItem>
      );
    }
    if (selection === 'multiple') {
      return (
        <DropdownMenuPrimitive.CheckboxItem key={item.id} {...common} checked={Boolean(item.checked)}>
          {body}
        </DropdownMenuPrimitive.CheckboxItem>
      );
    }
    return (
      <DropdownMenuPrimitive.Item key={item.id} {...common}>
        {body}
      </DropdownMenuPrimitive.Item>
    );
  });

  const checkedId = section.items.find((item) => item.checked)?.id ?? '';
  return (
    <>
      {sectionHasDivider(section, index) ? <Divider /> : null}
      {selection === 'single' ? (
        <DropdownMenuPrimitive.RadioGroup value={checkedId} aria-label={section.label} data-slot="action-menu-section" data-section-id={section.id}>
          <SectionLabel section={section} />
          {rows}
        </DropdownMenuPrimitive.RadioGroup>
      ) : (
        <DropdownMenuPrimitive.Group aria-label={section.label} data-slot="action-menu-section" data-section-id={section.id}>
          <SectionLabel section={section} />
          {rows}
        </DropdownMenuPrimitive.Group>
      )}
    </>
  );
};

/** Read-only reference list: no selection, no menu roles. */
const ListSection: React.FC<{ section: ActionMenuSection; index: number }> = ({ section, index }) => (
  <>
    {sectionHasDivider(section, index) ? <Divider /> : null}
    <div role="group" aria-label={section.label} data-slot="action-menu-section" data-section-id={section.id}>
      {section.label ? (
        <div
          data-slot="action-menu-label"
          className={cn(
            'px-2.5 text-[var(--oui-foreground-muted)]',
            section.labelStyle === 'caps' ? 'pt-2 pb-[3px] text-[11px] uppercase tracking-[0.05em]' : 'pt-1.5 pb-1 text-[11.5px]',
          )}
        >
          {section.label}
        </div>
      ) : null}
      {section.items.map((item) => (
        <div
          key={item.id}
          data-slot="action-menu-item"
          data-item-id={item.id}
          data-tone={item.tone}
          className={cn('flex items-center justify-between gap-3 rounded-[7px] px-2.5 py-[5px] text-[13px]', rowTone(item))}
        >
          <span className="min-w-0 truncate">{item.label}</span>
          {item.shortcut?.length ? (
            <kbd
              data-slot="action-menu-shortcut"
              className={cn('shrink-0 text-[11.5px] font-normal', MONO, item.tone === 'danger' ? '' : 'text-[var(--oui-foreground-muted)]')}
            >
              {item.shortcut.join('')}
            </kbd>
          ) : null}
        </div>
      ))}
    </div>
  </>
);

/**
 * Omni ActionMenu: a popup menu described entirely as data. `sections` of rows
 * (checked / icon column that stays aligned, description, shortcut glyphs, danger
 * tone, disabled with a visible reason), an optional leading `notice` (status +
 * fix action), a pinned `hint` row, viewport-aware height with internal scroll,
 * and configurable placement. Every callback is a prop.
 *
 * `kind="menu"` is a Radix dropdown menu (arrow keys, Enter, Escape, typeahead;
 * radio / checkbox / plain rows by `selection`). `kind="list"` is a read-only
 * grouped reference list (a Popover dialog) such as the shortcuts menu.
 *
 * @example
 * <ActionMenu
 *   trigger={<button>Mode</button>}
 *   label="When to analyse"
 *   sections={[{ id: 'mode', label: 'When to analyse', items: [
 *     { id: 'manual', label: 'Manual', description: 'Analyse only when you press it', checked: true, shortcut: ['⌘', '⇧', 'S'] },
 *     { id: 'auto', label: 'Auto', checked: false, shortcut: ['⌥', '⇧', 'U'] },
 *   ] }]}
 *   onSelect={(id) => setMode(id)}
 * />
 */
export const ActionMenu: React.FC<ActionMenuProps> = ({
  trigger,
  label,
  title,
  sections,
  notice,
  hint,
  kind = 'menu',
  onSelect,
  onValueChange,
  returnFocus = 'keyboard',
  open,
  defaultOpen,
  onOpenChange,
  side = 'bottom',
  align = 'start',
  sideOffset = 6,
  collisionPadding = 8,
  width = 300,
  maxHeight,
  portal = true,
  container,
  modal = false,
  className,
  'data-testid': testId,
}) => {
  const listKind = kind === 'list';
  const availableHeight = listKind ? 'var(--radix-popover-content-available-height)' : 'var(--radix-dropdown-menu-content-available-height)';
  const style: React.CSSProperties = {
    width: cssLength(width),
    maxWidth: 'calc(100vw - 16px)',
    maxHeight: maxHeight !== undefined ? `min(${cssLength(maxHeight)}, ${availableHeight})` : availableHeight,
  };
  const contentClass = cn(SURFACE, className);
  const placement = { side, align, sideOffset, collisionPadding } as const;

  const resolved = React.useMemo(() => sections.map(withValue), [sections]);

  const choose = (item: ActionMenuItem, section: ActionMenuSection) => {
    item.onSelect?.();
    onSelect?.(item.id, item);
    if (resolveSelection(section) === 'single') onValueChange?.(section.id, item.id);
  };

  // Last input device, tracked while mounted: decides whether a close returns focus to the trigger.
  const lastInput = React.useRef<'pointer' | 'keyboard'>('keyboard');
  React.useEffect(() => {
    const pointer = () => (lastInput.current = 'pointer');
    const keyboard = () => (lastInput.current = 'keyboard');
    document.addEventListener('pointerdown', pointer, true);
    document.addEventListener('keydown', keyboard, true);
    return () => {
      document.removeEventListener('pointerdown', pointer, true);
      document.removeEventListener('keydown', keyboard, true);
    };
  }, []);
  const handleCloseAutoFocus = (event: Event) => {
    if (returnFocus === 'keyboard' && lastInput.current === 'pointer') {
      event.preventDefault();
      // The pointer press focused the trigger; leave nothing focused.
      const active = document.activeElement;
      if (active instanceof HTMLElement && active !== document.body) active.blur();
    }
  };
  const noticeAction = () => notice?.action?.onSelect();

  const body = (
    <>
      <div data-slot="action-menu-scroll" className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        {notice ? <NoticeBlock notice={notice} interactive={!listKind} onAction={noticeAction} /> : null}
        {title ? (
          <div data-slot="action-menu-title" className="px-2.5 pt-1.5 pb-1 text-[11.5px] text-[var(--oui-foreground-muted)]">
            {title}
          </div>
        ) : null}
        {resolved.map((section, index) =>
          listKind ? (
            <ListSection key={section.id} section={section} index={index} />
          ) : (
            <MenuSection key={section.id} section={section} index={index} onChoose={(item) => choose(item, section)} />
          ),
        )}
      </div>
      {hint ? <HintRow hint={hint} /> : null}
    </>
  );

  if (listKind) {
    const content = (
      <PopoverPrimitive.Content
        data-slot="action-menu"
        data-kind="list"
        data-testid={testId}
        aria-label={label}
        {...placement}
        className={contentClass}
        style={style}
        onCloseAutoFocus={handleCloseAutoFocus}
      >
        {body}
      </PopoverPrimitive.Content>
    );
    return (
      <PopoverPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
        {portal ? <PopoverPrimitive.Portal container={container}>{content}</PopoverPrimitive.Portal> : content}
      </PopoverPrimitive.Root>
    );
  }

  const content = (
    <DropdownMenuPrimitive.Content
      data-slot="action-menu"
      data-kind="menu"
      data-testid={testId}
      aria-label={label}
      // Radix names the menu after its trigger; the explicit label wins.
      aria-labelledby={undefined}
      {...placement}
      className={contentClass}
      style={style}
      onCloseAutoFocus={handleCloseAutoFocus}
    >
      {body}
    </DropdownMenuPrimitive.Content>
  );
  return (
    <DropdownMenuPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
      <DropdownMenuPrimitive.Trigger asChild>{trigger}</DropdownMenuPrimitive.Trigger>
      {portal ? <DropdownMenuPrimitive.Portal container={container}>{content}</DropdownMenuPrimitive.Portal> : content}
    </DropdownMenuPrimitive.Root>
  );
};
ActionMenu.displayName = 'ActionMenu';
