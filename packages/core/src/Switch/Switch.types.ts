import * as React from 'react';

import type { RootProps } from '../lib';
import type { FieldLayoutProps } from '../Input/Input.variants';

export interface SwitchPrimitiveProps extends RootProps {
  id?: string;
  name?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  className?: string;
  'data-testid'?: string;
  'aria-describedby'?: string;
  'aria-label'?: string;
}

export interface SwitchProps extends SwitchPrimitiveProps, FieldLayoutProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  /** Where to place the switch relative to the label. Default `right`. */
  switchSide?: 'left' | 'right';
  wrapperClassName?: string;
  labelClassName?: string;
}
