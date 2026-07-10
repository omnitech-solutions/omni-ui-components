import * as React from 'react';

import type { RootProps } from '../lib';

export interface WizardStep {
  /** Stable id for the step (used as key + URL slug when needed). */
  name: string;
  /** Visible label rendered in the step indicator. */
  label: React.ReactNode;
  /** Step body — rendered when this step is active. */
  content?: React.ReactNode;
  /** Disable navigating to this step. */
  disabled?: boolean;
  /** Render-time predicate for whether the step is valid + can be left. */
  canAdvance?: boolean;
}

/**
 * Props for the Omni Wizard step-indicator primitive (the row of
 * numbered circles + labels).
 *
 * @example
 * <WizardSteps steps={steps} value="payment" onChange={setStep} />
 */
export interface WizardStepsProps extends RootProps {
  steps: WizardStep[];
  value: string;
  onChange?: (next: string) => void;
  /** Disable clicking on un-reached future steps. Default true. */
  forceLinearForward?: boolean;
  className?: string;
  'data-testid'?: string;
}

/**
 * Props for the orchestrator Omni Wizard. Pass either fully-controlled
 * `currentStep` + `onStepChange`, or uncontrolled with `defaultStep`.
 *
 * @example
 * <Wizard steps={steps} defaultStep="basic" onComplete={save} />
 */
export interface WizardProps extends RootProps {
  steps: WizardStep[];
  /** Controlled current step name. */
  currentStep?: string;
  /** Uncontrolled initial step name. Defaults to the first step. */
  defaultStep?: string;
  onStepChange?: (next: string) => void;
  /** Called when the user clicks "Finish" on the last step. */
  onComplete?: () => void;
  /** Labels for the navigation actions. */
  labels?: {
    back?: string;
    next?: string;
    finish?: string;
  };
  /** Hide the navigation row (caller renders their own). */
  hideActions?: boolean;
  className?: string;
  contentClassName?: string;
  actionsClassName?: string;
  'data-testid'?: string;
}
