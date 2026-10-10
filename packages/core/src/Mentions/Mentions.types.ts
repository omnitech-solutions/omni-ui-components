import type * as React from 'react';
import type { FieldLayoutProps } from '../Input/Input.variants';
import type { TextareaPrimitiveProps } from '../Textarea/Textarea.types';

/** One thing that can be mentioned. Extend it with your own fields: the option reaches `onMention` by reference. */
export interface MentionsOption {
  /** The text written after the trigger when the option is picked. */
  value: string;
  /** What the row shows. Defaults to `value`. A string label is also searched. */
  label?: React.ReactNode;
  /** A second, muted line under the label. */
  description?: React.ReactNode;
  /** Shown, but skipped by the keyboard and not pickable. */
  disabled?: boolean;
}

/** Every string Mentions shows or speaks. */
export interface MentionsLabels {
  /** Accessible name of the suggestion list. */
  suggestions: string;
}

export const DEFAULT_MENTIONS_LABELS: MentionsLabels = {
  suggestions: 'Suggestions',
};

/**
 * Raw Omni Mentions primitive props: a textarea that suggests `options` after a trigger character, no chrome.
 * The value is plain text.
 *
 * @example
 * <MentionsPrimitive aria-label="Comment" value={text} onChange={setText} options={people} />
 */
export interface MentionsPrimitiveProps<T extends MentionsOption = MentionsOption>
  extends Omit<TextareaPrimitiveProps, 'value' | 'defaultValue' | 'onChange' | 'ref'> {
  value?: string;
  defaultValue?: string;
  /** Fires on every edit and on a pick (with the whole new text). */
  onChange?: (next: string) => void;
  options?: T[];
  /**
   * The character(s) that start a mention, at the start of the text or after whitespace. Default `'@'`.
   * Several triggers share the one `options` list: use `onSearch` to give each its own.
   */
  trigger?: string | string[];
  /**
   * `true` (default): options are narrowed by the text typed after the trigger (case-insensitive, on `value` and
   * a string `label`). `false`: the list is drawn as given, for a host that narrows or loads the options itself.
   */
  filter?: boolean;
  /** An option was picked: the option by reference, then the trigger that opened the list. */
  onMention?: (option: T, trigger: string) => void;
  /** The text after a trigger changed (informational: a host can answer by passing new `options`). */
  onSearch?: (query: string, trigger: string) => void;
  required?: boolean;
  labels?: Partial<MentionsLabels>;
}

/**
 * Chrome-wrapped Omni Mentions props (label + description + error rows).
 *
 * @example
 * <Mentions label="Comment" value={text} onChange={setText} options={people} />
 */
export interface MentionsProps<T extends MentionsOption = MentionsOption>
  extends MentionsPrimitiveProps<T>,
    FieldLayoutProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
}
