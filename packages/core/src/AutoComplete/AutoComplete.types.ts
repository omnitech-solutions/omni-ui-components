import type * as React from 'react';
import type { InputPrimitiveProps } from '../Input/Input.types';
import type { FieldLayoutProps } from '../Input/Input.variants';

/** One suggestion. Extend it with your own fields: the option reaches `onSelect` by reference. */
export interface AutoCompleteOption {
  /** The text written into the field when the option is picked. */
  value: string;
  /** What the row shows. Defaults to `value`. A string label is also searched. */
  label?: React.ReactNode;
  /** Shown, but skipped by the keyboard and not pickable. */
  disabled?: boolean;
}

/** Every string AutoComplete shows or speaks. */
export interface AutoCompleteLabels {
  /** Placeholder of the field when the `placeholder` prop is not given. */
  placeholder: string;
  /** Shown under the field when text is typed and no option matches. */
  noResults: string;
  /** Accessible name of the suggestion list. */
  suggestions: string;
}

export const DEFAULT_AUTOCOMPLETE_LABELS: AutoCompleteLabels = {
  placeholder: 'Search…',
  noResults: 'No results.',
  suggestions: 'Suggestions',
};

/**
 * Raw Omni AutoComplete primitive props: a free-text input with a suggestion list, no chrome.
 * The value is the typed string; a value outside `options` is valid.
 *
 * @example
 * <AutoCompletePrimitive aria-label="Assignee" value={name} onChange={setName} options={people} />
 */
export interface AutoCompletePrimitiveProps<T extends AutoCompleteOption = AutoCompleteOption>
  extends Omit<
    InputPrimitiveProps,
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'onSelect'
    | 'onSubmit'
    | 'multiline'
    | 'maxHeight'
    | 'sendOnEnter'
    | 'commitOnEnter'
    | 'role'
    | 'ref'
  > {
  value?: string;
  defaultValue?: string;
  /** Fires on every keystroke and on a pick (with the option's `value`). */
  onChange?: (next: string) => void;
  /** A suggestion was picked: the option by reference. Fires in addition to `onChange(option.value)`. */
  onSelect?: (option: T) => void;
  options?: T[];
  /**
   * `true` (default): options are narrowed by the typed text (case-insensitive, on `value` and a string `label`).
   * `false`: the list is drawn as given, for a host that narrows or loads the options itself.
   */
  filter?: boolean;
  /** Leading icon. Default: a search icon. `null` draws none. */
  icon?: React.ReactNode;
  required?: boolean;
  labels?: Partial<AutoCompleteLabels>;
}

/**
 * Chrome-wrapped Omni AutoComplete props (label + description + error rows).
 *
 * @example
 * <AutoComplete label="Assignee" value={name} onChange={setName} options={people} />
 */
export interface AutoCompleteProps<T extends AutoCompleteOption = AutoCompleteOption>
  extends AutoCompletePrimitiveProps<T>,
    FieldLayoutProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
}
