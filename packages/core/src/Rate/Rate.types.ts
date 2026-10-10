import type * as React from 'react';
import type { FieldLayoutProps } from '../Input/Input.variants';
import type { RootProps } from '../lib';
import type { RateSize } from './Rate.variants';

/** Every string the control speaks. */
export interface RateLabels {
  /** Accessible name of one mark. Default: `1 star`, `2 stars`, … */
  mark: (value: number, count: number) => string;
}

export const DEFAULT_RATE_LABELS: RateLabels = {
  mark: (value) => `${value} ${value === 1 ? 'star' : 'stars'}`,
};

/**
 * Props for the Rate primitive: a radio group of marks, nothing else.
 *
 * @example
 * <RatePrimitive aria-label="Score" value={score} onChange={setScore} />
 */
export interface RatePrimitiveProps extends RootProps {
  /** On the `radiogroup` root. Focusing the root by id lands on the mark that holds the tab stop. */
  id?: string;
  /** With a name, the value is also written to a hidden input for native form posts. */
  name?: string;
  /** The rating, 0 (none) to `count`. */
  value?: number;
  /** Default 0. */
  defaultValue?: number;
  onChange?: (next: number) => void;
  /** How many marks. Default 5. */
  count?: number;
  /** Activating the current value again clears it to 0. Default true. */
  allowClear?: boolean;
  /** The mark. Default: a star. It takes the filled or the empty colour from the control. */
  icon?: React.ReactNode;
  /** Mark size. Default `default`. */
  size?: RateSize;
  disabled?: boolean;
  /** Focusable and announced read-only; the value cannot change. */
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  labels?: Partial<RateLabels>;
  /** @deprecated Use `labels.mark`. */
  starLabel?: (value: number, count: number) => string;
  'aria-describedby'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/**
 * Props for the chrome-wrapped Rate (label, description and error rows).
 *
 * @example
 * <Rate label="Answer quality" required value={score} onChange={setScore} />
 */
export interface RateProps extends RatePrimitiveProps, FieldLayoutProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
}

export type { RateSize } from './Rate.variants';
