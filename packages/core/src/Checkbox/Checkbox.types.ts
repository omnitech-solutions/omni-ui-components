import * as React from 'react';

import type { RootProps } from '../lib';
import type { FieldLayoutProps } from '../Input/Input.variants';

export interface CheckboxOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

export type CheckboxOrientation = 'vertical' | 'horizontal';

/**
 * Props for a single checkbox primitive (one boolean).
 *
 * @example
 * <CheckboxPrimitive checked={agreed} onChange={setAgreed} />
 */
export interface CheckboxPrimitiveProps extends RootProps {
  id?: string;
  name?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (next: boolean) => void;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  className?: string;
  autoFocus?: boolean;
  'data-testid'?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
}

/**
 * Props for the chrome-wrapped boolean Checkbox.
 *
 * @example
 * <Checkbox label="Subscribe to updates" description="Once a week, no spam." />
 */
export interface CheckboxProps extends CheckboxPrimitiveProps, FieldLayoutProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
}

/**
 * Props for a multi-checkbox group primitive (array of enums).
 *
 * @example
 * <CheckboxGroupPrimitive
 *   name="notifications"
 *   value={['email', 'sms']}
 *   onChange={setNotifications}
 *   options={[{ value: 'email', label: 'Email' }, { value: 'sms', label: 'SMS' }]}
 * />
 */
export interface CheckboxGroupPrimitiveProps extends RootProps {
  name?: string;
  options: CheckboxOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (next: string[]) => void;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  orientation?: CheckboxOrientation;
  className?: string;
  id?: string;
  'data-testid'?: string;
  'aria-describedby'?: string;
}

/**
 * Props for the chrome-wrapped CheckboxGroup (label / description / error rows).
 */
export interface CheckboxGroupProps extends CheckboxGroupPrimitiveProps, FieldLayoutProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
}
