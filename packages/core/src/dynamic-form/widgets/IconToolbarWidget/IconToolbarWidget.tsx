import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';
import { ChevronDown, ChevronUp, Copy, Trash2, X, type LucideIcon } from 'lucide-react';

import { IconButton, type IconButtonVariant } from '@omnitech/omni-ui-core';

/**
 * IconToolbarWidget — a non-data RJSF widget that renders a row of
 * Omni {@link IconButton}s declared in `ui:options.actions`. Useful
 * for kitchen-sink demos and form-level affordances that don't map to a
 * traditional input.
 *
 * Per-action shape:
 *   { icon: 'trash' | 'copy' | 'move-up' | 'move-down' | 'x', label, variant?, onClick? }
 *
 * Lucide `Trash2` auto-defaults to the `destructive` variant via the
 * Omni `IconButton`, so callers don't need to repeat it.
 *
 * @example
 * const uiSchema = {
 *   quick_actions: {
 *     'ui:widget': 'iconToolbar',
 *     'ui:options': {
 *       actions: [
 *         { icon: 'move-up',   label: 'Move up',   variant: 'ghost' },
 *         { icon: 'move-down', label: 'Move down', variant: 'ghost' },
 *         { icon: 'copy',      label: 'Duplicate', variant: 'ghost' },
 *         { icon: 'x',         label: 'Clear',     variant: 'ghost' },
 *         { icon: 'trash',     label: 'Delete' },
 *       ],
 *     },
 *   },
 * };
 */
export interface IconToolbarAction {
  icon: 'trash' | 'copy' | 'move-up' | 'move-down' | 'x';
  label: string;
  variant?: IconButtonVariant;
  onClick?: () => void;
}

const ICON_MAP: Record<IconToolbarAction['icon'], LucideIcon> = {
  trash: Trash2,
  copy: Copy,
  'move-up': ChevronUp,
  'move-down': ChevronDown,
  x: X,
};

export const IconToolbarWidget = (props: WidgetProps) => {
  const { id, options, disabled, readonly } = props;
  const actions = (options?.actions as IconToolbarAction[] | undefined) ?? [];
  const isDisabled = Boolean(disabled || readonly);

  return (
    <div id={id} data-slot="icon-toolbar" className="inline-flex items-center gap-1 self-start rounded-md border border-[var(--oui-border-field)] p-1">
      {actions.map((action, idx) => {
        const Icon = ICON_MAP[action.icon];
        return (
          <IconButton
            key={`${action.icon}-${idx}`}
            aria-label={action.label}
            title={action.label}
            variant={action.variant}
            disabled={isDisabled}
            onClick={action.onClick}
            icon={<Icon />}
          />
        );
      })}
    </div>
  );
};
