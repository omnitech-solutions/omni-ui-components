import { cn } from 'lib/utils';
import * as React from 'react';
import { Button } from '../Button';
import { Popconfirm } from '../Popconfirm';
import { Toolbar } from '../Toolbar';
import type { SessionBarProps } from './SessionBar.types';
import { SESSION_BAR_SURFACE } from './SessionBar.variants';

/**
 * Omni SessionBar: the live-session footer. It is the Toolbar `bar` variant (full width, wraps, nothing
 * absolutely positioned) with the panel surface, a `leading` slot (the StatusClock) and right-aligned
 * actions built from config: Pause (neutral outline, filled icon) and Resume (green solid, filled icon) share one
 * slot and swap with `status`; End is an outlined red button whose optional `confirm` config opens a
 * Popconfirm. Every label, icon node and callback is a prop. The background never depends on `status`.
 *
 * @example
 * <SessionBar status={paused ? 'paused' : 'live'} leading={<StatusClock … />}
 *   pause={{ icon: <Pause />, onClick: pause }} resume={{ icon: <Play />, onClick: resume }}
 *   end={{ onClick: end, confirm: { title: 'End the session?' } }} />
 */
export const SessionBar = React.forwardRef<HTMLDivElement, SessionBarProps>(
  (
    {
      label = 'Session controls',
      status = 'live',
      leading,
      pause,
      resume,
      end,
      actions,
      className,
      'data-testid': testId,
    },
    ref,
  ) => {
    const endButton =
      end === null || end === undefined ? null : (
        <Button
          buttonSize="control"
          variant="outline"
          tone="danger"
          soft
          icon={end.icon}
          disabled={end.disabled}
          onClick={end.confirm ? undefined : end.onClick}
          data-slot="session-end"
        >
          {end.label ?? 'End session'}
        </Button>
      );

    const toggle =
      status === 'paused' ? (
        <Button
          buttonSize="control"
          tone="success"
          fillIcon
          icon={resume?.icon}
          disabled={resume?.disabled}
          onClick={resume?.onClick}
          data-slot="session-resume"
        >
          {resume?.label ?? 'Resume session'}
        </Button>
      ) : (
        <Button
          buttonSize="control"
          variant="outline"
          tone="neutral"
          soft
          fillIcon
          icon={pause?.icon}
          disabled={pause?.disabled}
          onClick={pause?.onClick}
          data-slot="session-pause"
          className="border-[color:var(--oui-session-pause-border)]"
        >
          {pause?.label ?? 'Pause session'}
        </Button>
      );

    const defaultActions = (
      <>
        {toggle}
        {endButton && end?.confirm ? (
          <Popconfirm
            title={end.confirm.title}
            description={end.confirm.description}
            confirmText={end.confirm.confirmText ?? 'End now'}
            cancelText={end.confirm.cancelText ?? 'Keep going'}
            onConfirm={end.onClick}
            onCancel={end.confirm.onCancel}
          >
            {endButton}
          </Popconfirm>
        ) : (
          endButton
        )}
      </>
    );

    return (
      <Toolbar
        ref={ref}
        label={label}
        variant="bar"
        separators={false}
        leading={leading}
        trailing={actions ?? defaultActions}
        className={cn(SESSION_BAR_SURFACE, className)}
        data-testid={testId}
      />
    );
  },
);
SessionBar.displayName = 'SessionBar';
