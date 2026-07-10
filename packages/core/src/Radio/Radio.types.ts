import * as React from 'react';

import type { RootProps } from '../lib';
import type { FieldLayoutProps } from '../Input/Input.variants';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

export type RadioOrientation = 'vertical' | 'horizontal';

/**
 * Props for the Radio primitive (just the radio group itself).
 *
 * @example
 * <RadioPrimitive
 *   name="plan"
 *   options={[{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }]}
 *   value={plan}
 *   onChange={setPlan}
 * />
 */
export interface RadioPrimitiveProps extends RootProps {
  name?: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  /** `vertical` (default) stacks options; `horizontal` lays them inline. */
  orientation?: RadioOrientation;
  className?: string;
  id?: string;
  'data-testid'?: string;
  'aria-describedby'?: string;
}

/**
 * Props for the chrome-wrapped Radio (label / description / error rows).
 *
 * @example
 * <Radio label="Billing plan" required value={plan} onChange={setPlan} options={plans} />
 */
export interface RadioProps extends RadioPrimitiveProps, FieldLayoutProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
}
