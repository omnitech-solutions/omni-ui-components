import * as React from 'react';
import { Check } from 'lucide-react';

import { cn } from 'lib/utils';
import type { WizardStepsProps } from './Wizard.types';

/**
 * Wizard step indicator — numbered circles separated by em-dashes.
 * Completed steps fill with `bg-primary` + checkmark; active step is
 * `bg-foreground`; upcoming steps render as hollow outlines.
 *
 * Linear-forward by default (clicking an unreached step is a no-op).
 * Set `forceLinearForward={false}` to allow jumping ahead.
 */
const WizardStepsInner = React.forwardRef<HTMLElement, WizardStepsProps>(
  ({ steps, value, onChange, forceLinearForward = true, className, 'data-testid': testId }, ref) => {
    const activeIdx = steps.findIndex((s) => s.name === value);

    return (
      <nav
        ref={ref}
        aria-label="Wizard steps"
        data-slot="wizard-steps"
        data-testid={testId}
        className={cn('flex flex-wrap items-center gap-3 text-sm', className)}
      >
        {steps.map((step, idx) => {
          const done = activeIdx >= 0 && idx < activeIdx;
          const active = idx === activeIdx;
          const reached = activeIdx >= 0 && idx <= activeIdx;
          const clickable = !step.disabled && (forceLinearForward ? reached : true);

          return (
            <React.Fragment key={step.name}>
              {idx > 0 ? (
                <span aria-hidden="true" className="text-[var(--oui-foreground-muted)]">
                  —
                </span>
              ) : null}
              <button
                type="button"
                disabled={step.disabled || !clickable}
                onClick={() => onChange?.(step.name)}
                aria-current={active ? 'step' : undefined}
                data-testid={testId ? `${testId}-step-${step.name}` : undefined}
                data-slot="wizard-step-trigger"
                data-state={done ? 'done' : active ? 'active' : 'upcoming'}
                className={cn(
                  'inline-flex items-center gap-2 bg-transparent border-0 p-0 outline-none rounded-sm',
                  'focus-visible:ring-2 focus-visible:ring-ring',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                  clickable && 'cursor-pointer',
                )}
              >
                <span
                  className={cn(
                    'inline-flex size-5 items-center justify-center rounded-full text-[11px] font-semibold transition-colors',
                    done && 'bg-primary text-primary-foreground',
                    active && 'bg-foreground text-background',
                    !done && !active && 'border border-[var(--oui-border-field)] text-[var(--oui-foreground-muted)]',
                  )}
                >
                  {done ? <Check className="size-3" /> : idx + 1}
                </span>
                <span className={cn('font-medium', done || active ? 'text-[var(--oui-foreground)]' : 'text-[var(--oui-foreground-muted)]')}>{step.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </nav>
    );
  },
);
WizardStepsInner.displayName = 'WizardSteps';

export const WizardSteps = React.memo(WizardStepsInner) as typeof WizardStepsInner;
