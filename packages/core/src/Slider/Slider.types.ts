import * as React from 'react';

import type { RootProps } from '../lib';
import type { FieldLayoutProps } from '../Input/Input.variants';

export type SliderOrientation = 'horizontal' | 'vertical';

/**
 * Props for the Omni Slider primitive (track + thumb only).
 *
 * Supports both single-thumb and range modes — pass a `number` for
 * single-value, or a `number[]` (length 2+) for ranges.
 */
export interface SliderPrimitiveProps extends RootProps {
  id?: string;
  name?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number | number[];
  defaultValue?: number | number[];
  onChange?: (next: number | number[]) => void;
  onValueCommit?: (next: number | number[]) => void;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  orientation?: SliderOrientation;
  inverted?: boolean;
  minStepsBetweenThumbs?: number;
  className?: string;
  'data-testid'?: string;
  'aria-describedby'?: string;
  'aria-label'?: string;
}

/**
 * Props for the chrome-wrapped Slider (label / description / error rows +
 * inline current-value display).
 */
export interface SliderProps extends SliderPrimitiveProps, FieldLayoutProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  /** Render the current value next to the slider. Default `true`. */
  showValue?: boolean;
  /** Custom formatter for the displayed value. Default identity. */
  formatValue?: (value: number) => React.ReactNode;
  /** Unit suffix appended to the displayed value (e.g. `%`, `px`). */
  valueSuffix?: string;
  wrapperClassName?: string;
  labelClassName?: string;
}
