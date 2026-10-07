import type * as React from 'react';

/** One tab of the dialog: its nav row and its panel. Extend it with your own fields (`interface MyTab extends SettingsTab<MyTab> { badge: number }`); callbacks and `render` get the full tab back. */
export interface SettingsTab<Self = any> {
  id: string;
  label: string;
  /** Caller-supplied icon node. */
  icon?: React.ReactNode;
  /** The panel body. Called only for the active tab. */
  render: (tab: Self) => React.ReactNode;
}

export interface SettingsDialogLabels {
  /** Dialog title and name. Default `Settings`. */
  title: string;
  /** Close button name. Default `Close`. */
  close: string;
}

export interface SettingsDialogProps<Tab extends SettingsTab<Tab> = SettingsTab> {
  open: boolean;
  /** Fires when closing is requested (Escape, the backdrop or the close button). The caller sets `open` false. The close button is not rendered without it. */
  onClose?: () => void | Promise<void>;
  tabs: Tab[];
  /** The id of the tab shown (controlled). Omit for `defaultTab`, else the first. */
  activeTab?: string;
  defaultTab?: string;
  /** Fires with the full tab item (the object you passed) whenever the shown tab changes (click or arrow keys), controlled or not. */
  onTabChange?: (tab: Tab) => void;
  /** Close button icon (caller node). */
  closeIcon?: React.ReactNode;
  /** Portal target for the dialog and its backdrop; default `document.body`. Lets a native host render it inside its own root. */
  container?: HTMLElement | null;
  labels?: Partial<SettingsDialogLabels>;
  className?: string;
  'data-testid'?: string;
}

/** `plain`: just the row. `boxed`: a bordered card (an inline setting). `danger`: a boxed card in the destructive tone. */
export type SettingRowTone = 'plain' | 'boxed' | 'danger';

export interface SettingRowProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: SettingRowTone;
  /** `inline` (default): text left, control right. `stack`: text above, control below, full width. */
  layout?: 'inline' | 'stack';
  /** Id of the control, so a stack title is a real `<label>`. */
  htmlFor?: string;
  /** The control: Switch, Segmented, Button, a textarea. */
  children?: React.ReactNode;
  className?: string;
}

export interface GeneralSettingsLabels {
  themeTitle: string;
  themeDescription: string;
  /** Names of the two theme choices. */
  light: string;
  dark: string;
  sendOnEnterTitle: string;
  sendOnEnterDescription: string;
  /** Accessible name of the Send with Enter switch. */
  sendOnEnterSwitch: string;
  shortcutsTitle: string;
}

export interface GeneralSettingsProps {
  /** `light` or `dark` (controlled). Omit for an uncontrolled choice starting at `defaultTheme`. */
  theme?: string;
  defaultTheme?: string;
  /** Fires with the new theme whenever it changes, controlled or not. The Theme row is not rendered without it. */
  onThemeChange?: (theme: string) => void;
  /** Theme choices; default Light and Dark from `labels`. */
  themeOptions?: { value: string; label: string }[];
  sendOnEnter?: boolean;
  defaultSendOnEnter?: boolean;
  /** Fires with the new value whenever Send with Enter changes, controlled or not. The row is not rendered without it. */
  onSendOnEnterChange?: (sendOnEnter: boolean) => void;
  /** The keyboard shortcut list (rendered with ShortcutList). Omit for none. */
  shortcuts?: import('../ShortcutList').ShortcutItem[];
  labels?: Partial<GeneralSettingsLabels>;
}
