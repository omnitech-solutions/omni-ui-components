import { cn } from 'lib/utils';
import * as React from 'react';
import type { IconButtonProps } from '../../IconButton';
import { IconButton } from '../../IconButton';

export interface IconActionProps extends Omit<IconButtonProps, 'icon' | 'label' | 'title'> {
  /** Caller-supplied icon node. Without one the first letter of `label` stands in, so a control is never blank. */
  icon?: React.ReactNode;
  /** Accessible name and tooltip. */
  label: string;
  /** Shown after the label in the tooltip: `New chat (⌘ ⇧ O)`. */
  shortcut?: string;
}

/** A compact ghost IconButton for shell chrome (list rows, header, dialog close). The icon is always a caller node. */
export const IconAction = React.forwardRef<HTMLButtonElement, IconActionProps>(
  ({ icon, label, shortcut, className, ...rest }, ref) => (
    <IconButton
      ref={ref}
      variant="ghost"
      label={label}
      title={shortcut ? `${label} (${shortcut})` : label}
      icon={
        icon ?? (
          <span aria-hidden="true" className="text-[11px] font-semibold">
            {label.charAt(0)}
          </span>
        )
      }
      className={cn(
        'size-8 text-[color:var(--oui-panel-meta-fg)] hover:text-[color:var(--oui-tone-neutral-fg)] [&_svg]:size-4',
        className,
      )}
      {...rest}
    />
  ),
);
IconAction.displayName = 'IconAction';
