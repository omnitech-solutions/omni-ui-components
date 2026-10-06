import * as React from 'react';

import { cn } from 'lib/utils';
import { Divider } from '../Divider';
import type { StatusClockProps } from './StatusClock.types';
import { statusClockIconVariants, statusClockTimerVariants, statusClockVariants } from './StatusClock.variants';

/**
 * Omni StatusClock: the live-session status of the footer. A caller-supplied icon node (the filled record
 * icon), a monospace elapsed timer the caller has already formatted, and a `live | paused` state. Paused
 * swaps in the amber pause icon, turns the timer amber and adds a "Paused" label; nothing else changes
 * colour. An optional `buildTag` renders `<short sha> · <branch>` in mono after a divider, click to copy
 * (`copied` is controlled; the caller decides it is a development build and only passes it then).
 *
 * @example
 * <StatusClock state="paused" elapsed="2:18:20" icon={<RecordIcon />} pausedIcon={<PauseCircleIcon />}
 *   buildTag={{ label: 'a1b2c3d · main', title: 'a1b2c3d4e5f6…', onCopy: copySha, copied }} />
 */
export const StatusClock = React.forwardRef<HTMLDivElement, StatusClockProps>(
  (
    {
      state = 'live',
      elapsed,
      icon,
      pausedIcon,
      pausedLabel = 'Paused',
      buildTag,
      label = 'Session status',
      className,
      'data-testid': testId,
      ...rest
    },
    ref,
  ) => {
    const paused = state === 'paused';
    const shownIcon = paused ? (pausedIcon ?? icon) : icon;
    return (
      <div
        ref={ref}
        role="group"
        aria-label={label}
        data-slot="status-clock"
        data-state={state}
        data-testid={testId}
        className={cn(statusClockVariants({ state }), className)}
        {...rest}
      >
        {shownIcon ? (
          <span data-slot="status-clock-icon" aria-hidden="true" className={statusClockIconVariants({ state })}>
            {shownIcon}
          </span>
        ) : null}
        <span data-slot="status-clock-timer" role="timer" className={statusClockTimerVariants({ state })}>
          {elapsed}
        </span>
        {paused && pausedLabel !== null ? (
          <span data-slot="status-clock-paused" className="flex-none text-[14px] font-medium text-[color:var(--oui-tone-warning-fg)]">
            {pausedLabel}
          </span>
        ) : null}
        {buildTag ? (
          <>
            <Divider
              orientation="vertical"
              decorative
              className="h-[var(--oui-control-separator)] flex-none bg-[color:var(--oui-tone-neutral-border)]"
            />
            <button
              type="button"
              data-slot="status-clock-build"
              data-copied={buildTag.copied ? 'true' : undefined}
              title={buildTag.title}
              aria-label={
                buildTag.copied ? (buildTag.copiedLabel ?? 'Copied') : (buildTag['aria-label'] ?? `Copy build ${buildTag.title ?? buildTag.label}`)
              }
              onClick={buildTag.onCopy}
              className={cn(
                'inline-flex h-6 min-w-0 cursor-pointer items-center gap-1.5 rounded-lg border-0 px-2.5 font-mono text-[12.5px]',
                'bg-[color:var(--oui-panel-dock-bg)] text-[color:var(--oui-panel-meta-fg)] hover:brightness-125',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                buildTag.copied && 'text-[color:var(--oui-tone-success-fg)]',
              )}
            >
              {buildTag.icon ? (
                <span aria-hidden="true" className="inline-flex flex-none [&_svg]:size-3.5">
                  {buildTag.icon}
                </span>
              ) : null}
              <span className="truncate">{buildTag.copied ? (buildTag.copiedLabel ?? 'Copied') : buildTag.label}</span>
            </button>
          </>
        ) : null}
      </div>
    );
  },
);
StatusClock.displayName = 'StatusClock';
