import type * as React from 'react';

/** How an integration is doing. Any string is accepted; these three have a tone. */
export type IntegrationStatus = 'connected' | 'unreachable' | 'off' | (string & {});

/** The minimum an integration row needs. Extend it with your own fields; every callback gets the full item back. */
export interface IntegrationItem {
  id: string;
  name: string;
  /** The second line: `4 tools · connected`. The caller words it. */
  detail?: string;
  status?: IntegrationStatus;
  enabled: boolean;
  /** Replaces the default tile glyph of this row. */
  icon?: React.ReactNode;
  /** Account chip for an OAuth integration (`ada@example.com`), shown under the detail. */
  account?: React.ReactNode;
  /** Per-row connect / reconnect button for an OAuth integration. */
  connectAction?: React.ReactNode;
}

export interface IntegrationListLabels {
  intro: string;
  /** Loading line. Default `Checking connectors…`. */
  loading: string;
  empty: string;
  /** Name of a row's switch and remove button, with the integration name: `Remove ${name}`. */
  remove: (name: string) => string;
  /** Name of a row's switch. Default the integration name. */
  toggle: (name: string) => string;
  /** Name and placeholder of the address field. */
  addField: string;
  addPlaceholder: string;
  add: string;
  /** Accessible name of the list. Default `Connectors`. */
  list: string;
}

export interface IntegrationListProps<I extends IntegrationItem = IntegrationItem> {
  /** The rows. `undefined` with `loading` shows the loading line. */
  items?: I[];
  loading?: boolean;
  /** Replaces the intro line; `null` hides it. */
  intro?: React.ReactNode;
  /** Fires when a row's switch is flipped, with the full integration item (the object you passed) and the new `enabled` value. The switches are not rendered without it. */
  onToggle?: (integration: I, enabled: boolean) => void | Promise<void>;
  /** Fires when a row's remove button is chosen, with the full integration item. The buttons are not rendered without it. */
  onRemove?: (integration: I) => void | Promise<void>;
  /** Fires on submit with the trimmed address (a value); the field clears after the call returns or resolves and keeps its text if it throws or rejects. The form is not rendered without it. */
  onAdd?: (url: string) => void | Promise<void>;
  /** Replaces the empty line. */
  empty?: React.ReactNode;
  /** Default glyph of a row's tile (caller node). */
  itemIcon?: React.ReactNode;
  removeIcon?: React.ReactNode;
  /** Above the list, right-aligned: an OAuth "Connect account" button. */
  connectAction?: React.ReactNode;
  labels?: Partial<IntegrationListLabels>;
  className?: string;
}
