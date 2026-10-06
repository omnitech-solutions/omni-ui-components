import * as React from 'react';
import { Check } from 'lucide-react';

import { cn } from 'lib/utils';
import { Progress } from '../Progress';

/** Checklist progress of one item. */
export type ChecklistState = 'done' | 'current' | 'pending';

/**
 * A step. The default variant uses `title` / `status`; the `checklist` variant
 * uses `label` (falls back to `title`) and `state`.
 */
export type StepItem = {
  key?: React.Key;
  title?: React.ReactNode;
  label?: React.ReactNode;
  state?: ChecklistState;
  description?: React.ReactNode;
  status?: 'wait' | 'process' | 'finish' | 'error';
  disabled?: boolean;
};
export interface StepsProps extends Omit<React.HTMLAttributes<HTMLOListElement>, 'onChange'> {
  /**
   * `default`: numbered, clickable steps. `checklist`: a read-only vertical list
   * (done check / current spinning ring / pending circle) for analysis progress.
   */
  variant?: 'default' | 'checklist';
  items?: StepItem[];
  current?: number;
  direction?: 'horizontal' | 'vertical';
  size?: 'default' | 'small';
  status?: 'wait' | 'process' | 'finish' | 'error';
  onChange?: (current: number) => void;
}

export const Steps = React.forwardRef<HTMLOListElement, StepsProps>(
  (
    { variant = 'default', items = [], current = 0, direction = 'horizontal', size = 'default', status = 'process', onChange, className, ...props },
    ref,
  ) => {
    if (variant === 'checklist') {
      return (
        <ol
          ref={ref}
          data-slot="steps"
          data-variant="checklist"
          aria-label="Steps"
          className={cn('m-0 flex list-none flex-col gap-3 p-0 text-sm', className)}
          {...props}
        >
          {items.map((item, index) => {
            const state = item.state ?? 'pending';
            return (
              <li
                key={item.key ?? index}
                data-state={state}
                aria-current={state === 'current' ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-[10px] text-[color:var(--oui-tone-neutral-fg)]',
                  state === 'done' && 'opacity-70',
                  state === 'current' && 'font-medium',
                  state === 'pending' && 'opacity-50',
                )}
              >
                <span data-slot="steps-marker" aria-hidden="true" className="flex size-[19px] shrink-0 items-center justify-center">
                  {state === 'done' ? (
                    <span className="flex size-[19px] items-center justify-center rounded-full bg-[color:var(--oui-tone-success-solid-bg)] text-[color:var(--oui-tone-success-solid-fg)]">
                      <Check className="size-3 stroke-[3]" />
                    </span>
                  ) : state === 'current' ? (
                    <Progress shape="ring" tone="accent" size={19} aria-hidden="true" />
                  ) : (
                    <span className="size-[19px] rounded-full border-[1.5px] border-current" />
                  )}
                </span>
                <span>{item.label ?? item.title}</span>
                <span className="sr-only">{state === 'done' ? '(done)' : state === 'current' ? '(in progress)' : '(pending)'}</span>
              </li>
            );
          })}
        </ol>
      );
    }
    return (
      <ol
        ref={ref}
        aria-label="Steps"
        className={cn('m-0 flex list-none items-start gap-4 p-0', direction === 'vertical' && 'flex-col', size === 'small' && 'text-sm', className)}
        {...props}
      >
        {items.map((item, index) => {
          const itemStatus = item.status ?? (index < current ? 'finish' : index === current ? status : 'wait');
          return (
            <li key={item.key ?? index} className={cn('flex min-w-0 gap-2', direction === 'horizontal' && 'flex-1')}>
              <button
                type="button"
                disabled={item.disabled}
                aria-current={index === current ? 'step' : undefined}
                className={cn(
                  'flex appearance-none gap-2 border-0 bg-transparent p-0 text-left',
                  itemStatus === 'process' && 'text-primary',
                  itemStatus === 'finish' && 'text-primary',
                  itemStatus === 'error' && 'text-destructive',
                )}
                onClick={() => onChange?.(index)}
              >
                <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full border">
                  {index + 1}
                </span>
                <span>
                  <span className="block font-medium">{item.title}</span>
                  {item.description && <span className="text-muted-foreground">{item.description}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    );
  },
);
Steps.displayName = 'Steps';
