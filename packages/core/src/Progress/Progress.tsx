import * as React from 'react';

import { cn } from 'lib/utils';
import { toneTextClasses, type ControlTone } from '../internal/support/controlTone';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `line` (default): the linear bar. `ring`: a circular indicator that fits a control's icon slot. */
  shape?: 'line' | 'ring';
  /** Line shape: completion, 0-100. */
  percent?: number;
  showInfo?: boolean;
  status?: 'normal' | 'success' | 'exception' | 'active';
  /**
   * Ring shape: completion, 0-100 (determinate). Leave unset for an indeterminate,
   * spinning ring (`aria-busy`, no `aria-valuenow`).
   */
  value?: number;
  /** Ring shape: colour from the shared `ControlTone` scale (default `accent`). */
  tone?: ControlTone;
  /** Ring shape: outer diameter in px (default 20, the control icon size). */
  size?: number;
}

/** Ring geometry: a 24-unit viewBox so the stroke scales with `size`. */
const RING_VIEWBOX = 24;
const RING_STROKE = 2.75;
const RING_RADIUS = (RING_VIEWBOX - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Omni Progress. The default `line` shape is a linear bar; `shape="ring"` is a
 * circular indicator: determinate with `value`, otherwise an indeterminate
 * spinning ring (swap it for an icon while work is running).
 *
 * @example
 * <Progress percent={64} />
 * <Progress shape="ring" tone="accent" />            // spinning, aria-busy
 * <Progress shape="ring" value={40} size={36} />     // determinate, aria-valuenow=40
 */
export const Progress = ({
  shape = 'line',
  percent = 0,
  showInfo = true,
  status = 'normal',
  value,
  tone = 'accent',
  size = 20,
  className,
  ...props
}: ProgressProps) => {
  if (shape === 'ring') {
    const determinate = typeof value === 'number';
    const clamped = determinate ? Math.max(0, Math.min(100, value)) : 0;
    const decorative = props['aria-hidden'] === true || props['aria-hidden'] === 'true';
    // A decorative ring (e.g. inside a step row) carries no role; otherwise it is a named progressbar.
    const a11y = decorative
      ? {}
      : {
          role: 'progressbar',
          'aria-label': props['aria-label'] ?? (determinate ? 'Progress' : 'Loading'),
          'aria-valuemin': 0,
          'aria-valuemax': 100,
          'aria-valuenow': determinate ? Math.round(clamped) : undefined,
          'aria-busy': determinate ? undefined : true,
        };
    return (
      <div
        data-slot="progress-ring"
        data-tone={tone}
        data-indeterminate={determinate ? undefined : 'true'}
        className={cn('inline-flex shrink-0', toneTextClasses[tone], className)}
        style={{ width: size, height: size }}
        {...props}
        {...a11y}
      >
        <svg
          viewBox={`0 0 ${RING_VIEWBOX} ${RING_VIEWBOX}`}
          width={size}
          height={size}
          fill="none"
          aria-hidden="true"
          className={cn(!determinate && 'animate-spin')}
        >
          <circle cx={RING_VIEWBOX / 2} cy={RING_VIEWBOX / 2} r={RING_RADIUS} stroke="currentColor" strokeOpacity={0.25} strokeWidth={RING_STROKE} />
          <circle
            data-slot="progress-ring-arc"
            cx={RING_VIEWBOX / 2}
            cy={RING_VIEWBOX / 2}
            r={RING_RADIUS}
            stroke="currentColor"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={RING_CIRCUMFERENCE * (determinate ? 1 - clamped / 100 : 0.72)}
            transform={`rotate(-90 ${RING_VIEWBOX / 2} ${RING_VIEWBOX / 2})`}
            className={cn(determinate && 'transition-[stroke-dashoffset]')}
          />
        </svg>
      </div>
    );
  }

  const clamped = Math.max(0, Math.min(100, percent));
  const barClassName = status === 'exception' ? 'bg-destructive' : status === 'success' ? 'bg-primary' : 'bg-primary';

  return (
    <div className={cn('space-y-2', className)} {...props}>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-[width]', barClassName, status === 'active' && 'animate-pulse')}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showInfo ? <div className="text-sm text-muted-foreground">{`${Math.round(clamped)}%`}</div> : null}
    </div>
  );
};
