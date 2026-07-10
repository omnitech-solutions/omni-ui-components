import * as React from 'react';
import { type DateRange } from 'react-day-picker';

import type { RootProps } from '../lib';
import type { FieldLayoutProps } from '../Input/Input.variants';

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
  placeholder?: string;
  /** Intl formatter override. Default `{ dateStyle: 'medium' }`. */
  formatOptions?: Intl.DateTimeFormatOptions;
  className?: string;
  'data-testid'?: string;
  'aria-describedby'?: string;
}

export interface DatePickerProps extends DatePickerPrimitiveProps, FieldLayoutProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
}
