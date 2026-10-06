import * as React from 'react';

import { cn } from 'lib/utils';
import { IconButton } from '../IconButton';
import { DEFAULT_COMPOSER_LABELS, type SendButtonProps } from './Composer.types';
import { composerRoundClasses } from './Composer.variants';

/**
 * The composer's round send control, in four states: `idle` (nothing to send: disabled arrow), `ready` (a draft: accent
 * arrow, `Send (Enter)`), `streaming` (a reply runs and the draft is empty: stop, `Stop (Esc)`) and `queue` (a reply runs
 * and there is a draft: `Queue message`). The state is decided by the caller (see `sendStateOf`); the icons are nodes
 * and the titles come from `labels`. Stop and queue are never disabled. Slot: `data-slot="send-button"` with `data-state`.
 *
 * @example
 * <SendButton state={sendStateOf({ streaming, hasDraft })} sendIcon={<ArrowUp />} stopIcon={<Square />} queueIcon={<ListPlus />} onClick={submit} />
 */
export const SendButton = React.forwardRef<HTMLButtonElement, SendButtonProps>(({ state, sendIcon, stopIcon, queueIcon, labels: labelsProp, className, disabled, ...rest }, ref) => {
  const labels = { ...DEFAULT_COMPOSER_LABELS, ...labelsProp };
  const label = state === 'streaming' ? labels.stop : state === 'queue' ? labels.queue : labels.send;
  const icon = state === 'streaming' ? (stopIcon ?? sendIcon) : state === 'queue' ? (queueIcon ?? sendIcon) : sendIcon;
  const muted = state === 'idle';
  return (
    <IconButton
      ref={ref}
      variant="ghost"
      iconSize="md"
      icon={icon}
      label={label}
      tone={muted ? undefined : 'accent'}
      disabled={disabled ?? muted}
      data-slot="send-button"
      data-state={state}
      className={cn(composerRoundClasses, className)}
      {...rest}
    />
  );
});
SendButton.displayName = 'SendButton';
