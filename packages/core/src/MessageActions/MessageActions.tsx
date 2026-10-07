import { cn } from 'lib/utils';
import * as React from 'react';
import { IconButton } from '../IconButton';
import { useRovingTabindex } from '../lib/use-roving-tabindex';
import type { MessageActionButton, MessageActionsProps } from './MessageActions.types';

/**
 * Omni MessageActions: the bar under a finished reply: icon buttons (copy, regenerate, thumbs, read aloud) built
 * from `actions` config, custom nodes (a VersionPager) in the same row, and quiet `meta` text at the end.
 * It is a `toolbar` with one tab stop: Left and Right (and Home / End) move focus between the enabled buttons, Tab leaves the bar. Toggles carry
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
  ({ actions, meta, label = 'Message actions', className, onKeyDown, onFocus, ...rest }, ref) => {
    // One tab stop for the whole bar: Left/Right/Home/End move focus and the stop; Tab leaves the toolbar.
    const barRef = React.useRef<HTMLDivElement | null>(null);
    const roving = useRovingTabindex(barRef, {
      orientation: 'horizontal',
      getItems: (root) => Array.from(root.querySelectorAll<HTMLElement>('button:not(:disabled)')),
    });
    const setRefs = (node: HTMLDivElement | null) => {
      barRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      roving.onKeyDown(event);
    };
    const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
      onFocus?.(event);
      roving.onFocus(event);
    };
    return (
      <div
        ref={setRefs}
        role="toolbar"
        aria-label={label}
        data-slot="message-actions"
        className={cn('flex flex-wrap items-center gap-0.5', className)}
        {...rest}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
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
          <span
            data-slot="message-actions-meta"
            className="ms-1.5 text-xs text-[color:var(--oui-panel-meta-fg)]"
          >
            {meta}
          </span>
        ) : null}
      </div>
    );
  },
);
MessageActionsImpl.displayName = 'MessageActions';

/** Generic over the action item type: an extended action reaches its `onClick` by reference. */
export const MessageActions = MessageActionsImpl as unknown as <
  T extends MessageActionButton = MessageActionButton,
>(
  props: MessageActionsProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null;
