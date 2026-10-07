import { cn } from 'lib/utils';
import * as React from 'react';
import type { StreamStatusLabels, StreamStatusProps } from './StreamStatus.types';
import { formatElapsed } from './StreamStatus.utils';
import {
  streamStatusPulseClasses,
  streamStatusTimerClasses,
  streamStatusVariants,
} from './StreamStatus.variants';

/** English defaults for every string. */
export const DEFAULT_STREAM_STATUS_LABELS: StreamStatusLabels = {
  calling: (toolName) => `Calling ${toolName}…`,
  completed: (toolName) => `${toolName} completed`,
  failed: (toolName) => `${toolName} failed`,
  unnamedTool: 'tool',
  reasoning: 'Reasoning…',
  stall: 'Still working… this is taking longer than usual.',
};

/** Re-renders once a second while `active`; returns the elapsed ms since `start`. */
function useElapsed(start: number, active: boolean): number {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (!active) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active, start]);
  return now - start;
}

/**
 * Omni StreamStatus: one status line for a streaming reply: a tool call (`Calling X…`, `X completed`, `X failed`), reasoning
 * (`Reasoning…`) or a stall notice, with an `mm:ss` elapsed timer that starts when the component mounts (or at `startedAt`)
 * and stops once a tool call has completed or failed. It is a polite live region (`role="status"`); the timer is not announced.
 *
 * @example
 * <StreamStatus kind="tool" toolName="search_docs" status="running" />
 */
export const StreamStatus = React.forwardRef<HTMLDivElement, StreamStatusProps>(
  (
    {
      kind,
      toolName,
      status = 'running',
      message,
      startedAt,
      icon,
      hideTimer = false,
      labels: labelsProp,
      className,
      ...rest
    },
    ref,
  ) => {
    const labels = React.useMemo(
      () => ({ ...DEFAULT_STREAM_STATUS_LABELS, ...labelsProp }),
      [labelsProp],
    );
    const [mountedAt] = React.useState(() => Date.now());
    const start = startedAt ?? mountedAt;
    const finished = kind === 'tool' && status !== 'running';
    const elapsed = useElapsed(start, !finished && !hideTimer);
    const name = toolName || labels.unnamedTool;
    let text: React.ReactNode;
    if (message !== undefined) text = message;
    else if (kind === 'reasoning') text = labels.reasoning;
    else if (kind === 'stall') text = labels.stall;
    else if (status === 'completed') text = labels.completed(name);
    else if (status === 'failed') text = labels.failed(name);
    else text = labels.calling(name);
    let tone: 'neutral' | 'success' | 'danger' | 'warning' = 'neutral';
    if (kind === 'stall') tone = 'warning';
    else if (kind === 'tool' && status === 'failed') tone = 'danger';
    else if (kind === 'tool' && status === 'completed') tone = 'success';
    return (
      <div
        ref={ref}
        role="status"
        data-slot="stream-status"
        data-kind={kind}
        data-status={kind === 'tool' ? status : undefined}
        className={cn(streamStatusVariants({ tone }), className)}
        {...rest}
      >
        {icon ? (
          <span
            aria-hidden="true"
            className={cn('inline-flex shrink-0', !finished && streamStatusPulseClasses)}
          >
            {icon}
          </span>
        ) : null}
        <span data-slot="stream-status-text">{text}</span>
        {hideTimer || finished ? null : (
          <span
            data-slot="stream-status-timer"
            aria-hidden="true"
            className={streamStatusTimerClasses}
          >
            {formatElapsed(elapsed)}
          </span>
        )}
      </div>
    );
  },
);
StreamStatus.displayName = 'StreamStatus';
