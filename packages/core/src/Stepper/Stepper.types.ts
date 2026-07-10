import * as React from 'react';

import type { RootProps } from '../lib';
import type { FieldLayoutProps } from '../Input/Input.variants';

export type StepperSize = 'sm' | 'default' | 'lg';

/**
 * Props for the Omni Stepper primitive (the pill row only).
 *
 * Renders: optional leading icon · value display · minus button · plus button,
 * all inside a single rounded-full bordered container.
 */
export interface StepperPrimitiveProps extends RootProps {
  id?: string;
  name?: string;
  value?: number;
  defaultValue?: number;
  onChange?: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  /** Optional leading icon node (e.g. lucide `FileText`). */
  icon?: React.ReactNode;
  /** Singular noun rendered after the value (e.g. "page"). */
  unit?: string;
  /** Plural form. Defaults to `${unit}s`. */
  unitPlural?: string;
  /** Custom formatter for the displayed value. Default `${value} ${unit | unitPlural}`. */
  formatValue?: (value: number) => React.ReactNode;
  stepperSize?: StepperSize;
  className?: string;
  'data-testid'?: string;
  'aria-describedby'?: string;
  'aria-label'?: string;
}

/**
 * Chrome-wrapped Omni Stepper.
 *
 * @example
 * <Stepper label="Number of pages" icon={<FileText />} unit="page" value={pages} onChange={setPages} min={1} max={50} />
 */
export interface StepperProps extends StepperPrimitiveProps, FieldLayoutProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
}
