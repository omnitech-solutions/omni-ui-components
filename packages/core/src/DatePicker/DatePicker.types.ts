import type * as React from 'react';
import type { DateRange } from 'react-day-picker';
import type { FieldLayoutProps, InputSize, InputVariant } from '../Input/Input.variants';
import type { RootProps } from '../lib';

export type DatePickerMode = 'single' | 'range';

export type { DateRange };

export interface DatePickerPrimitiveProps extends RootProps {
  id?: string;
  name?: string;
  mode?: DatePickerMode;
  value?: Date | DateRange | null;
  defaultValue?: Date | DateRange | null;
  onChange?: (next: Date | DateRange | null) => void;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  /** Read-only: stays focusable and readable, is announced as read-only, and cannot be changed. `disabled` wins. */
  readOnly?: boolean;
  /** The look of the field box. Default `bordered`. */
  variant?: InputVariant;
  /** The height of the field box. Default `default`. */
  inputSize?: InputSize;
  placeholder?: string;
  /** Intl formatter override. Default `{ dateStyle: 'medium' }`. */
  formatOptions?: Intl.DateTimeFormatOptions;
  className?: string;
  'data-testid'?: string;
  'aria-describedby'?: string;
  /** Ids that name the button; include the button's own id to keep the chosen date in its name. */
  'aria-labelledby'?: string;
}

export interface DatePickerProps extends DatePickerPrimitiveProps, FieldLayoutProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
}
