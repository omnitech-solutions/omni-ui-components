import * as React from 'react';

import type { RootProps } from '../lib';
import type { FieldLayoutProps } from '../Input/Input.variants';

export interface SegmentedOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

/**
 * Raw Omni Segmented primitive props (the toggle row only).
 *
 * @example
 * <SegmentedPrimitive value={tone} onChange={setTone} options={[…]} />
 */
export interface SegmentedPrimitiveProps extends RootProps {
  id?: string;
  name?: string;
  options: SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  className?: string;
  'data-testid'?: string;
  'aria-describedby'?: string;
}

/**
 * Chrome-wrapped Omni Segmented props.
 *
 * @example
 * <Segmented label="Tone" required value={tone} onChange={setTone} options={[…]} />
 */
export interface SegmentedProps extends SegmentedPrimitiveProps, FieldLayoutProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
}
