import type * as React from 'react';

/** A fact the assistant keeps. Extend it with your own fields; `onForget` gets the full item back. */
export interface MemoryItem {
  id: string;
  text: string;
}

export interface PreferencesFormLabels {
  instructionsTitle: string;
  instructionsDescription: string;
  memoryTitle: string;
  memoryDescription: string;
  /** Accessible name of the memory switch. Default `Memory`. */
  memorySwitch: string;
  /** Name of the memories list. Default `Memories`. */
  memoryList: string;
  /** Name of a Forget button: `Forget` (the fact is in the row). */
  forget: string;
  memoryEmpty: string;
  loading: string;
}

export interface PreferencesFormProps<M extends MemoryItem = MemoryItem> {
  /** The custom instructions. A change from outside replaces the field. */
  instructions: string;
  /** Fires on every keystroke with the new text. Debounce it yourself (see `useDebouncedCallback`) to autosave. */
  onChange?: (text: string) => void;
  /** Default 4000. */
  maxLength?: number;
  /** Visible lines of the textarea. Default 4. */
  rows?: number;
  /** Shows `labels.loading` instead of the form. */
  loading?: boolean;
  /** The remembered facts. The memory section is rendered when this is given. */
  memories?: M[];
  /** Whether memory is on (the switch state). */
  memoryEnabled?: boolean;
  /** Fires when the memory switch is flipped, with the new value. The switch is not rendered without it. */
  onMemoryToggle?: (enabled: boolean) => void | Promise<void>;
  /** Fires when a Forget button is chosen, with the full memory item (the object you passed). The buttons are not rendered without it. */
  onForget?: (memory: M) => void | Promise<void>;
  /** Caller node for the Forget buttons. */
  forgetIcon?: React.ReactNode;
  labels?: Partial<PreferencesFormLabels>;
  className?: string;
}
