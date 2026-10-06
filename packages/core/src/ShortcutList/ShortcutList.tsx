import * as React from 'react';

import { cn } from 'lib/utils';
import { describeShortcutKeys } from '../lib/chat/shortcuts';
import type { ShortcutItem, ShortcutListLabels, ShortcutListProps } from './ShortcutList.types';

export const DEFAULT_SHORTCUT_LIST_LABELS: ShortcutListLabels = { title: 'Keyboard shortcuts' };

/**
 * Omni ShortcutList: a read-only reference of actions and their keys. `keys` is a shortcut string (`mod+k`), turned
 * into glyphs by `describe` (default: ⌘ ⇧ ⌥ on a Mac, Ctrl Shift Alt elsewhere), or the glyphs themselves.
 *
 * Slots: `data-slot="shortcut-list" | "shortcut-label" | "shortcut-keys"`.
 *
 * @example
 * <ShortcutList items={[{ label: 'Search conversations', keys: 'mod+k' }, { label: 'Stop reply', keys: ['Esc'] }]} />
 */
export const ShortcutList = <S extends ShortcutItem = ShortcutItem>({ items, describe = describeShortcutKeys, title, labels: labelOverrides, className }: ShortcutListProps<S>) => {
  const labels = { ...DEFAULT_SHORTCUT_LIST_LABELS, ...labelOverrides };
  const headingId = React.useId();
  return (
    <div data-slot="shortcut-list" className={cn('flex flex-col gap-2', className)}>
      {title ? (
        <div id={headingId} className="text-[13.5px] font-medium">
          {title}
        </div>
      ) : null}
      <dl aria-label={title ? undefined : labels.title} aria-labelledby={title ? headingId : undefined} className="m-0 grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 text-[13px]">
        {items.map((item) => {
          const keys = typeof item.keys === 'string' ? describe(item.keys) : item.keys;
          return (
            <React.Fragment key={item.id ?? item.label}>
              <dt data-slot="shortcut-label" className="text-[color:var(--oui-tone-neutral-fg)]">
                {item.label}
              </dt>
              <dd data-slot="shortcut-keys" className="m-0 flex justify-end gap-1">
                {keys.map((key, index) => (
                  <kbd
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${key}-${index}`}
                    className="min-w-6 rounded-md border border-solid border-[color:var(--oui-panel-border)] bg-[color:var(--oui-tone-neutral-bg)] px-1.5 py-0.5 text-center font-mono text-[11.5px] text-[color:var(--oui-panel-meta-fg)]"
                  >
                    {key}
                  </kbd>
                ))}
              </dd>
            </React.Fragment>
          );
        })}
      </dl>
    </div>
  );
};
