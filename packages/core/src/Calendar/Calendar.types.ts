import type * as React from 'react';
import type { FieldLayoutProps } from '../Input/Input.variants';
import type { RootProps } from '../lib';

/**
 * Props of the date-choice control (the month grid only, no chrome).
 *
 * @example
 * <CalendarPrimitive value={day} onChange={setDay} />
 */
export interface CalendarPrimitiveProps extends RootProps {
  id?: string;
  /** With a name, the chosen day is also written to a hidden input as `YYYY-MM-DD`. */
  name?: string;
  /** The chosen day, or `null` for none. */
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (next: Date | null) => void;
  /** Days before this one cannot be chosen. */
  min?: Date;
  /** Days after this one cannot be chosen. */
  max?: Date;
  /** The month shown first when there is no value. Default: the current month. */
  defaultMonth?: Date;
  /** Choosing the chosen day again clears it. Default true; a required field never clears. */
  allowClear?: boolean;
  disabled?: boolean;
  /** Read-only: the grid stays focusable and browsable; the day cannot change. `disabled` wins. */
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  'aria-describedby'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/**
 * Props of the date-choice control inside the shared field chrome.
 *
 * @example
 * <CalendarField label="Start date" required value={day} onChange={setDay} />
 */
export interface CalendarFieldProps extends CalendarPrimitiveProps, FieldLayoutProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
}
