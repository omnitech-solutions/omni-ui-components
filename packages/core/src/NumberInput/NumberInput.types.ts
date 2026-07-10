import * as React from 'react';

import type { RootProps } from '../lib';
import type { FieldLayoutProps } from '../Input/Input.variants';

export interface NumberInputPrimitiveProps extends RootProps {
  id?: string;
  name?: string;
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (next: number | null) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  min?: number;
  max?: number;
  step?: number;
  /** Decimal places to display. */
  decimals?: number;
  /** Use locale-aware thousand separators while editing. Default false. */
  thousandSeparator?: boolean;
  /** Locale for thousand separator. Default `navigator.language`. */
  locale?: string;
  /** Prefix string rendered before the value (e.g. `$`). */
  prefix?: string;
  /** Suffix string rendered after the value (e.g. `%`, `km`). */
  suffix?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  className?: string;
  'data-testid'?: string;
  'aria-describedby'?: string;
  'aria-label'?: string;
}

export interface NumberInputProps extends NumberInputPrimitiveProps, FieldLayoutProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
}
