import type * as React from 'react';
import type { FieldLayoutProps } from '../Input/Input.variants';
import type { RootProps } from '../lib';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

export type RadioOrientation = 'vertical' | 'horizontal';

/** `plain` (default): a mark and its text. `card`: each option is a bordered card; the chosen one is tinted. */
export type RadioAppearance = 'plain' | 'card';

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
  /** Read-only: stays focusable and readable, is announced as read-only, and cannot be changed. `disabled` wins. */
  readOnly?: boolean;
  /** `vertical` (default) stacks options; `horizontal` lays them inline. */
  orientation?: RadioOrientation;
  /** How each option is drawn; behaviour is identical. Default `plain`. */
  appearance?: RadioAppearance;
  className?: string;
  id?: string;
  'data-testid'?: string;
  'aria-describedby'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
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
