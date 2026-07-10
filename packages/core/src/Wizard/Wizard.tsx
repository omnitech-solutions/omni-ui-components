import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from 'lib/utils';
import { Button } from '../Button';
import { WizardSteps } from './WizardSteps';
import type { WizardProps, WizardStep } from './Wizard.types';

/**
 * Omni Wizard — orchestrates a multi-step flow.
 *
 * Composes:
 * - {@link WizardSteps} (step indicator)
 * - The current step's `content`
 * - Back / Next / Finish action row (skippable via `hideActions`)
 *
 * Controlled mode: pass `currentStep` + `onStepChange`. Uncontrolled:
 * pass `defaultStep` (or omit — first step is used).
 *
 * @example
 * <Wizard
 *   steps={[
 *     { name: 'basic',   label: 'Basic info', content: <BasicInfoForm /> },
 *     { name: 'payment', label: 'Payment',     content: <PaymentForm /> },
 *     { name: 'review',  label: 'Review',      content: <ReviewPanel />, canAdvance: hasAgreed },
 *   ]}
 *   onComplete={() => save()}
 * />
 */
const WizardInner = React.forwardRef<HTMLDivElement, WizardProps>(
  (
    { steps, currentStep, defaultStep, onStepChange, onComplete, labels, hideActions, className, contentClassName, actionsClassName, 'data-testid': testId },
    ref,
  ) => {
    const firstStep: WizardStep | undefined = steps[0];
    const fallback = defaultStep ?? firstStep?.name ?? '';
    const [internal, setInternal] = React.useState<string>(fallback);
    const isControlled = currentStep !== undefined;
    const active = isControlled ? (currentStep as string) : internal;

    const activeIdx = steps.findIndex((s) => s.name === active);
    const activeStep = activeIdx >= 0 ? steps[activeIdx] : firstStep;
    const isFirst = activeIdx <= 0;
    const isLast = activeIdx === steps.length - 1;
    const canAdvance = activeStep?.canAdvance !== false;

    const setStep = React.useCallback(
      (next: string) => {
        if (!isControlled) setInternal(next);
        onStepChange?.(next);
      },
      [isControlled, onStepChange],
    );

    const handleBack = () => {
      if (isFirst) return;
      const prev = steps[activeIdx - 1];
      if (prev) setStep(prev.name);
    };

    const handleNext = () => {
      if (!canAdvance) return;
      if (isLast) {
        onComplete?.();
        return;
      }
      const nextStep = steps[activeIdx + 1];
      if (nextStep) setStep(nextStep.name);
    };

    return (
      <div ref={ref} data-slot="wizard" data-testid={testId} className={cn('flex w-full flex-col gap-6', className)}>
        <WizardSteps steps={steps} value={active} onChange={setStep} data-testid={testId ? `${testId}-steps` : undefined} />
        <div data-slot="wizard-content" className={cn('flex flex-col gap-4', contentClassName)}>
          {activeStep?.content}
        </div>
        {hideActions ? null : (
          <div data-slot="wizard-actions" className={cn('flex items-center justify-between gap-2', actionsClassName)}>
            <Button variant="ghost" onClick={handleBack} disabled={isFirst} icon={<ChevronLeft />} data-testid={testId ? `${testId}-back` : undefined}>
              {labels?.back ?? 'Back'}
            </Button>
            <Button
              variant="default"
              onClick={handleNext}
              disabled={!canAdvance}
              iconAfter={isLast ? undefined : <ChevronRight />}
              data-testid={testId ? `${testId}-next` : undefined}
            >
              {isLast ? (labels?.finish ?? 'Finish') : (labels?.next ?? 'Next')}
            </Button>
          </div>
        )}
      </div>
    );
  },
);
WizardInner.displayName = 'Wizard';

export const Wizard = React.memo(WizardInner) as typeof WizardInner;
