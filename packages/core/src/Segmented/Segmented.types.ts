import type * as React from 'react';
import type { FieldLayoutProps } from '../Input/Input.variants';
import type { RootProps } from '../lib';

export interface SegmentedOption {
  value: string;
  /** Visible text. Optional for an icon-only option (then give `ariaLabel`). */
  label?: React.ReactNode;
  /** Leading icon node (caller-supplied, so a product can pass its own icon set). */
  icon?: React.ReactNode;
  /** Accessible name for an icon-only option; also its hover tooltip. Defaults to a string `label`. */
  ariaLabel?: string;
  disabled?: boolean;
  /**
   * Makes the option unusable but still hoverable and focusable (`aria-disabled`);
   * the reason is its tooltip. Use instead of `disabled` when the user should learn why.
   */
  disabledReason?: React.ReactNode;
}

/** `pill` (default): rounded-full muted pill. `control`: the 36px bordered control-row group (Native App toolbar). */
export type SegmentedAppearance = 'pill' | 'control';

interface SegmentedPrimitiveBaseProps extends RootProps {
  id?: string;
  name?: string;
  options: SegmentedOption[];
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  /** Read-only: stays focusable and readable, is announced as read-only, and cannot be changed. `disabled` wins. */
  readOnly?: boolean;
  className?: string;
  /** Visual style; behaviour is identical. Default `pill`. */
  appearance?: SegmentedAppearance;
  /**
   * Multiple mode: the fewest options that must stay on. At the minimum, the
   * remaining on-option(s) cannot be turned off and show `minActiveReason`. Default 0.
   */
  minActive?: number;
  /** Tooltip on an option that is locked by `minActive`. */
  minActiveReason?: React.ReactNode;
  'data-testid'?: string;
  'aria-describedby'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/** One option on at a time (default); `onChange` gets the picked value. */
export interface SegmentedSingleProps {
  mode?: 'single';
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
}

/** Several options on at once (a toggle group); `value` and `onChange` carry the array of on-values. */
export interface SegmentedMultipleProps {
  mode: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onChange?: (next: string[]) => void;
}

/**
 * Raw Omni Segmented primitive props (the toggle row only).
 *
 * @example
 * <SegmentedPrimitive value={tone} onChange={setTone} options={[…]} />
 * <SegmentedPrimitive mode="multiple" appearance="control" minActive={1} value={panels} onChange={setPanels} options={[…]} />
 */
export type SegmentedPrimitiveProps = SegmentedPrimitiveBaseProps &
  (SegmentedSingleProps | SegmentedMultipleProps);

/**
 * Chrome-wrapped Omni Segmented props.
 *
 * @example
 * <Segmented label="Tone" required value={tone} onChange={setTone} options={[…]} />
 */
export type SegmentedProps = SegmentedPrimitiveProps &
  FieldLayoutProps & {
    label?: React.ReactNode;
    description?: React.ReactNode;
    error?: React.ReactNode;
    wrapperClassName?: string;
    labelClassName?: string;
  };
