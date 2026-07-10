import * as React from 'react';
import { FileText } from 'lucide-react';

import type { StepperProps } from '@omnitech/omni-ui-core/Stepper';
import type { Variant } from '../../internal/support/makeFactory';

/** Build `<Stepper>` props for standalone (non-RJSF) stories and tests. */
export const stepperPropsFactory = (overrides: Partial<StepperProps> = {}): StepperProps => ({
  id: 'demo-stepper',
  label: 'Number of pages',
  icon: <FileText />,
  unit: 'page',
  min: 1,
  max: 50,
  step: 1,
  value: 7,
  layout: 'vertical',
  required: false,
  disabled: false,
  ...overrides,
});

/** Ordered variant matrix used by the cheatsheet + kitchen-sink stories. */
export const stepperVariants: Variant<StepperProps>[] = [
  { name: 'Default', args: { label: 'Default', value: 7 } },
  { name: 'At min', args: { label: 'At min', value: 1 } },
  { name: 'At max', args: { label: 'At max', value: 50 } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: 12 } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Pick a page count', value: 1 } },
];
