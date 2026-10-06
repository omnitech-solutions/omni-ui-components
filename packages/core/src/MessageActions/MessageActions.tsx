import * as React from 'react';

import { cn } from 'lib/utils';
import { IconButton } from '../IconButton';
import type { MessageActionButton, MessageActionsProps } from './MessageActions.types';

/**
 * Omni MessageActions: the bar under a finished reply: icon buttons (copy, regenerate, thumbs, read aloud) built
 * from `actions` config, custom nodes (a VersionPager) in the same row, and quiet `meta` text at the end.
 * It is a `toolbar`: Left and Right (and Home / End) move focus between the enabled buttons. Toggles carry
 * `aria-pressed`; icons are nodes you pass in.
 *
 * Slots: `data-slot="message-actions" | "message-action" | "message-actions-meta"`.
 *
 * @example
 * <MessageActions actions={[
 *   { id: 'copy', icon: <Copy />, label: 'Copy', onClick: copy },
 *   { id: 'up', icon: <ThumbsUp />, label: 'Good reply', pressed: rating === 'up', onClick: up },
 * ]} meta="Claude · 1,284 tokens" />
 */
const MessageActionsImpl = React.forwardRef<HTMLDivElement, MessageActionsProps>(
  ({ actions, meta, label = 'Message actions', className, onKeyDown, ...rest }, ref) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
      if (buttons.length === 0) return;
      const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
      if (at === -1) return;
      event.preventDefault();
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? buttons.length - 1
            : (at + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next]?.focus();
    };
    return (
      <div
        ref={ref}
        role="toolbar"
        aria-label={label}
        data-slot="message-actions"
        className={cn('flex flex-wrap items-center gap-0.5', className)}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {actions.map((action) =>
          'node' in action ? (
            <React.Fragment key={action.id}>{action.node}</React.Fragment>
          ) : !action.onClick ? null : (
            <IconButton
              key={action.id}
              variant="ghost"
              iconSize="sm"
              icon={action.icon}
              label={action.label}
              tone={action.tone}
              pressed={action.pressed}
              disabled={action.disabled}
              data-slot="message-action"
              data-action={action.id}
              onClick={() => action.onClick?.(action)}
            />
          ),
        )}
        {meta ? (
          <span data-slot="message-actions-meta" className="ms-1.5 text-xs text-[color:var(--oui-panel-meta-fg)]">
            {meta}
          </span>
        ) : null}
      </div>
    );
  },
);
MessageActionsImpl.displayName = 'MessageActions';

/** Generic over the action item type: an extended action reaches its `onClick` by reference. */
export const MessageActions = MessageActionsImpl as unknown as <T extends MessageActionButton = MessageActionButton>(
  props: MessageActionsProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null;
