import type * as React from 'react';

import type { ControlTone } from '../internal/support/controlTone';

/** One icon button of the bar. */
export interface MessageActionButton {
  id: string;
  icon: React.ReactNode;
  /** Accessible name and tooltip. */
  label: string;
  /**
   * Fires when the button is chosen, with the full action item itself (the same object passed in `actions`, so your own
   * extra fields are on it). A toggle's caller flips `pressed`. Without it the button is not rendered. Method syntax so an
   * extended item still fits the base type.
   */
  onClick?(action: this): void | Promise<void>;
  /** Toggle state (`aria-pressed`): thumbs, read aloud. Leave unset for a plain button. */
  pressed?: boolean;
  disabled?: boolean;
  tone?: ControlTone;
}

/** A custom node in the bar, e.g. a `VersionPager`. */
export interface MessageActionNode {
  id: string;
  node: React.ReactNode;
}

export type MessageAction<T extends MessageActionButton = MessageActionButton> =
  | T
  | MessageActionNode;

export interface MessageActionsProps<T extends MessageActionButton = MessageActionButton>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Buttons (your own item type, extended with any fields) and custom nodes. */
  actions: MessageAction<T>[];
  /** Quiet text after the buttons, e.g. `DeepSeek R1 · 1,284 tokens · local`. */
  meta?: React.ReactNode;
  /** Accessible name of the toolbar. Default `Message actions`. */
  label?: string;
}
