import * as React from 'react';

import { Button } from '../Button';
import { Popover, PopoverContent } from '../Popover';

export interface TourStep {
  title?: React.ReactNode;
  description?: React.ReactNode;
}

export interface TourProps {
  open?: boolean;
  current?: number;
  steps: TourStep[];
  onCurrentChange?: (step: number) => void;
  onClose?: () => void;
}

export const Tour = ({ open = false, current = 0, steps, onCurrentChange, onClose }: TourProps) => {
  const step = steps[current];
  const lastIndex = steps.length - 1;
  if (!open || !step) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" aria-hidden="true" />
      <Popover open>
        <PopoverContent className="fixed right-6 top-6 z-50 w-[min(calc(100vw-2rem),24rem)] rounded-xl border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] p-0 shadow-2xl">
          <div className="space-y-4">
            <div className="border-b border-[var(--oui-border-field)] px-5 py-4">
              <div className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--oui-foreground-muted)]">
                Step {current + 1} of {steps.length}
              </div>
              {step.title ? <div className="mt-2 text-base font-semibold text-[var(--oui-foreground)]">{step.title}</div> : null}
              {step.description ? <div className="mt-2 text-sm leading-6 text-[var(--oui-foreground-muted)]">{step.description}</div> : null}
            </div>
            <div className="flex items-center justify-between px-5 pb-5">
              <Button buttonSize="sm" variant="secondary" disabled={current <= 0} onClick={() => onCurrentChange?.(current - 1)}>
                Back
              </Button>
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {steps.map((_, index) => (
                  <span
                    key={index}
                    className={
                      index === current
                        ? 'h-2.5 w-6 rounded-full bg-[var(--oui-foreground)]'
                        : 'h-2.5 w-2.5 rounded-full bg-[var(--oui-border-field)]'
                    }
                  />
                ))}
              </div>
              {current < lastIndex ? (
                <Button buttonSize="sm" onClick={() => onCurrentChange?.(current + 1)}>
                  Next
                </Button>
              ) : (
                <Button buttonSize="sm" onClick={onClose}>
                  Finish
                </Button>
              )}
            </div>
            <div className="border-t border-[var(--oui-border-field)] px-5 pb-4 pt-3">
              <button type="button" className="text-sm text-[var(--oui-foreground-muted)] transition-colors hover:text-[var(--oui-foreground)]" onClick={onClose}>
                Skip tour
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
