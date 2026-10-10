import type * as React from 'react';
import type { FieldLayoutProps } from '../Input/Input.variants';
import type { RootProps } from '../lib';
import type { SelectVariantProps } from './Select.variants';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Section heading. Options with the same `group` render under a shared
   *  non-selectable heading. Options with no `group` render in the
   *  default (un-headed) section. */
  group?: string | null;
  /** Optional descriptive text shown beneath the label. */
  description?: string | null;
  /** Optional avatar URL for option renderers that include imagery. */
  avatarUrl?: string | null;
  /** Optional 2-letter initials shown when no avatar URL is present. */
  initials?: string | null;
  /** Optional small color dot rendered before the label. */
  color?: string | null;
}

/** Footer action rendered below the options list (e.g. "Manage Tax Rates"). */
export interface SelectFooterAction {
  label: string;
  /** With an `href` the action is drawn as a link element: the browser follows it, the library never navigates. */
  href?: string | null;
  /** Called when the action is chosen. The host routes, opens or saves. */
  onSelect?: () => void;
}

/**
 * Props for the Select primitive (the native `<select>` element only).
 *
 * @example
 * <SelectPrimitive
 *   variant="bordered"
 *   selectSize="default"
 *   options={[{ value: 'US', label: 'United States' }, ...]}
 *   value={country}
 *   onChange={setCountry}
 * />
 */
export interface SelectPrimitiveProps
  extends Omit<React.ComponentProps<'select'>, 'onChange' | 'size'>,
    SelectVariantProps,
    RootProps {
  invalid?: boolean;
  /** Read-only: stays focusable and readable, is announced as read-only, and cannot be changed. `disabled` wins. */
  readOnly?: boolean;
  /** The same sizes under the name every field-shaped control answers to. `selectSize` wins when both are given. */
  inputSize?: SelectVariantProps['selectSize'];
  options: SelectOption[];
  /** Placeholder rendered as a disabled option when value is empty. */
  placeholder?: string;
  /** Show the search input inside the popover. Default `false`. */
  searchable?: boolean;
  /** Footer action rendered below the option list. */
  footerAction?: SelectFooterAction;
  onChange?: (next: string) => void;
}

/**
 * Props for the chrome-wrapped Select (label / description / error rows).
 *
 * @example
 * <Select label="Country" required value={country} onChange={setCountry} options={countries} />
 */
export interface SelectProps extends SelectPrimitiveProps, FieldLayoutProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  wrapperClassName?: string;
  labelClassName?: string;
}

export type { SelectSize, SelectVariant, SelectVariantProps } from './Select.variants';
