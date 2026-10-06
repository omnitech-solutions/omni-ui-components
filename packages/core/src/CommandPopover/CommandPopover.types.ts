import * as React from 'react';

/** One row of the popover: a slash command or an `@` surface. */
export interface CommandItem {
  /** Stable id: the React key and the DOM id suffix. For a slash command it is the command word (`new`). */
  id: string;
  /** Row text: the command word (shown after `labelPrefix`) or the surface name. */
  label: string;
  description?: string;
  /** Caller-supplied icon node. */
  icon?: React.ReactNode;
}

/** Every user-visible string of the popover. */
export interface CommandPopoverLabels {
  /** Shown when `items` is empty (and `hideWhenEmpty` is off). Default `Nothing matches`. */
  empty: string;
  /** Shown while an async `source` is still answering and there is nothing to list yet. Default `Searching…`. */
  loading: string;
}

export const DEFAULT_COMMAND_POPOVER_LABELS: CommandPopoverLabels = {
  empty: 'Nothing matches',
  loading: 'Searching…',
};

/** Hint line of the slash popover in the original: `↑↓ navigate · ⏎ select · esc close`. */
export const DEFAULT_COMMAND_HINT = '↑↓ navigate · ⏎ select · esc close';

export interface CommandPopoverProps<T extends CommandItem = CommandItem> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect' | 'title'> {
  /** The rows. Extend `CommandItem` with your own fields: `onSelect` hands the same object back. */
  items: readonly T[];
  /** Index of the highlighted row (`aria-selected`). Default 0. */
  activeIndex?: number;
  /** Highlighted row when uncontrolled. Default 0. */
  defaultActiveIndex?: number;
  /** Fires with the new index whenever the highlight moves (hover), in both controlled and uncontrolled mode. */
  onActiveChange?: (index: number) => void;
  /** The popover asks to close: a mouse press outside it, or Escape while focus is inside. The host hides it. */
  onClose?: () => void;
  /** A row was chosen (click). Payload: the full item (the same object from `items`) and its index. Keyboard choice goes through the hook's `onKeyDown`. */
  onSelect: (item: T, index: number) => void | Promise<void>;
  /** Accessible name of the listbox, e.g. `Commands` or `Add from Notes`. */
  label: string;
  /** Visible heading above the rows (often the same as `label`). Omit for none. */
  title?: React.ReactNode;
  /** Text before each label, e.g. `/` for commands (set in mono). */
  labelPrefix?: string;
  /** Footer hint line. Omit for none. */
  hint?: React.ReactNode;
  /** Render nothing when there are no items (the slash popover). Default false: show `labels.empty` (the `@` popover). */
  hideWhenEmpty?: boolean;
  /** An async source is still answering. */
  loading?: boolean;
  /** Base id of the listbox; rows are `${id}-option-${index}`. Pair with `aria-activedescendant` on the textarea. */
  id?: string;
  /**
   * The element the popover sits against (the composer root or the textarea). Set: the popover renders in a portal
   * (`container`, default `document.body`) with `position: fixed` above or below the anchor and the anchor's width, so an
   * ancestor with `overflow: hidden` (the Panel dock) cannot clip it. Presses inside the anchor, and inside the composer
   * that holds it, never count as outside presses for `onClose`. Not set: absolutely positioned inside its `relative` parent.
   */
  anchor?: HTMLElement | null;
  /** Portal target when `anchor` is set. Default `document.body`. */
  container?: HTMLElement | null;
  /** Where the popover sits against its `relative` parent: `above` (default, over a composer) or `below`. */
  placement?: 'above' | 'below';
  labels?: Partial<CommandPopoverLabels>;
}

/** What a trigger needs: how to recognise it in the draft, where its rows come from, what picking does. */
export interface CommandTrigger<T extends CommandItem = CommandItem> {
  /** Stable id, e.g. `slash` or `mention`. */
  id: string;
  /** Matched against the whole draft; group 1 is the query. See {@link SLASH_PATTERN} and {@link MENTION_PATTERN}. */
  pattern: RegExp;
  /**
   * The rows: an array (filtered with `filter`), or `source(query)` returning rows or a promise of rows (the host
   * filters; a stale answer never replaces a newer one).
   */
  source: readonly T[] | ((query: string) => readonly T[] | Promise<readonly T[]>);
  /** Filter for an array `source`. Default: the label contains the query (case-insensitive). */
  filter?: (item: T, query: string) => boolean;
  /** Called with the chosen row. `draft` is the text at that moment and `match` the trigger's regexp match. */
  onPick: (item: T, context: { draft: string; query: string; match: RegExpExecArray }) => void | Promise<void>;
  /** Props handed to the popover for this trigger (label, title, hint, prefix, empty behaviour). */
  popover: Pick<CommandPopoverProps<T>, 'label' | 'title' | 'hint' | 'labelPrefix' | 'hideWhenEmpty' | 'labels'>;
}

export interface UseCommandTriggerOptions<T extends CommandItem = CommandItem> {
  /** The draft text. */
  value: string;
  triggers: readonly CommandTrigger<T>[];
  /** Off: nothing opens. */
  disabled?: boolean;
  /** Called after a row was picked (focus the textarea again here). */
  onAfterPick?: () => void;
  /** Fires when the popover closes without a pick: Escape in the textarea, a press outside, or `close()`. */
  onClose?: () => void;
  /** Base id of the listbox. Default: generated. */
  id?: string;
}
