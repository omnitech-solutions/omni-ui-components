import * as React from 'react';

import { cn } from 'lib/utils';
import { IconAction } from '../internal/support/IconAction';
import { initialsOf } from '../lib/chat/initials';
import type { ConversationListFooterProps } from './ConversationList.types';

/**
 * The foot of a ConversationList: avatar initials (from `user.initials`, else the name), the name and detail, and a
 * settings gear. Renders nothing when there is neither a user nor a gear.
 */
export const ConversationListFooter = ({ user, onOpenSettings, settingsIcon, settingsLabel = 'Settings', className }: ConversationListFooterProps) => {
  if (!user && !onOpenSettings) return null;
  return (
    <div data-slot="conversation-list-user" className={cn('flex items-center gap-2.5 px-3 py-2.5', className)}>
      {user ? (
        <>
          <span
            aria-hidden="true"
            data-slot="conversation-list-avatar"
            className="flex size-7 flex-none items-center justify-center rounded-full bg-[color:var(--oui-tone-accent-bg)] text-[11px] font-semibold text-[color:var(--oui-tone-accent-fg)]"
          >
            {user.initials ?? initialsOf(user.name)}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[13px] font-medium">{user.name}</div>
            {user.detail ? <div className="truncate text-[11.5px] text-[color:var(--oui-panel-meta-fg)]">{user.detail}</div> : null}
          </div>
        </>
      ) : (
        <div className="flex-1" />
      )}
      {onOpenSettings ? <IconAction icon={settingsIcon} label={settingsLabel} onClick={() => void onOpenSettings()} /> : null}
    </div>
  );
};
