import * as React from 'react';

import type { WizardProps, WizardStep } from '@oc-tech/omni-ui-components/Wizard';

export const SAMPLE_STEPS: WizardStep[] = [
  {
    name: 'basic',
    label: 'Basic info',
    content: <p className="text-sm text-muted-foreground">Step 1 — basic info form would render here.</p>,
  },
  {
    name: 'payment',
    label: 'Payment',
    content: <p className="text-sm text-muted-foreground">Step 2 — payment configuration.</p>,
  },
  {
    name: 'review',
    label: 'Review',
    content: <p className="text-sm text-muted-foreground">Step 3 — review and submit.</p>,
  },
];

/** Build `<Wizard>` props for standalone stories and tests. */
export const wizardPropsFactory = (overrides: Partial<WizardProps> = {}): WizardProps => ({
  steps: SAMPLE_STEPS,
  defaultStep: 'basic',
  ...overrides,
});
