import * as React from 'react';
import { ImagePlus, MicOff } from 'lucide-react';

import { Button } from '@oc-tech/omni-ui-components/Button';
import type { ActionMenuNotice, ActionMenuProps, ActionMenuSection } from '@oc-tech/omni-ui-components/ActionMenu';
import type { Variant } from '../../internal/support/makeFactory';

export type CaptureMode = 'manual' | 'auto';

/** "When to analyse" + "Display" sections of the capture caret menu (board 1c), controlled by `mode` and `display`. */
export const captureMenuSections = (mode: CaptureMode = 'manual', display = 'follow'): ActionMenuSection[] => [
  {
    id: 'mode',
    label: 'When to analyse',
    value: mode,
    items: [
      { id: 'manual', label: 'Manual', description: 'Analyse only when you press it', shortcut: ['⌘', '⇧', 'S'] },
      { id: 'auto', label: 'Auto', description: 'When the screen changes · every 8 s, up to 120 per session', shortcut: ['⌥', '⇧', 'U'] },
    ],
  },
  {
    id: 'display',
    label: 'Display',
    highlightChecked: false,
    value: display,
    items: [
      { id: 'follow', label: 'Follow my browser', description: 'Built-in Retina Display right now' },
      { id: 'builtin', label: 'Built-in Retina Display' },
    ],
  },
  {
    id: 'extra',
    items: [{ id: 'add-screen', label: 'Add screen to this problem', icon: <ImagePlus />, disabledReason: 'Available once a problem is open' }],
  },
];

/** Microphone device list, controlled by `device`. */
export const micDevicesSection = (device = 'macbook'): ActionMenuSection => ({
  id: 'devices',
  label: 'Microphone',
  highlightChecked: false,
  value: device,
  items: [
    { id: 'macbook', label: 'MacBook Pro Microphone' },
    { id: 'airpods', label: 'AirPods Pro' },
  ],
});

const stopListening: ActionMenuSection = {
  id: 'listening',
  items: [{ id: 'stop', label: 'Stop listening', icon: <MicOff />, shortcut: ['⌥', 'R'] }],
};

const styleItem = (id: string, label: string) => ({ id, label });

/** Answer-style groups (Technical / Conversation): one single-select across both, controlled by `value`. */
export const answerStyleSections = (value = 'dsa'): ActionMenuSection[] => [
  {
    id: 'technical',
    label: 'Technical',
    labelStyle: 'caps',
    value,
    items: [
      styleItem('programming', 'Programming'),
      styleItem('dsa', 'Data Structures & Algorithms'),
      styleItem('system-design', 'System Design'),
      styleItem('data-science', 'Data Science'),
      styleItem('devops', 'DevOps & Infrastructure'),
    ],
  },
  {
    id: 'conversation',
    label: 'Conversation',
    labelStyle: 'caps',
    value,
    items: [
      styleItem('behavioural', 'Behavioural Interview'),
      styleItem('sales', 'Sales & Business'),
      styleItem('presentation', 'Presentation Skills'),
      styleItem('negotiation', 'Negotiation'),
    ],
  },
];

/** Every answer-style row as `{ id, label }`, in menu order (for the trigger label of a select-style menu). */
export const answerStyleOptions = answerStyleSections().flatMap((section) => section.items.map((item) => ({ id: item.id, label: item.label })));

const shortcutRow = (id: string, label: string, shortcut: string[], tone?: 'danger') => ({ id, label, shortcut, tone });

export const shortcutSections: ActionMenuSection[] = [
  {
    id: 'capture',
    label: 'Capture',
    labelStyle: 'caps',
    items: [shortcutRow('analyse', 'Analyse / stop', ['⌘', '⇧', 'S']), shortcutRow('auto', 'Auto on or off', ['⌥', '⇧', 'U'])],
  },
  {
    id: 'listening',
    label: 'Listening',
    labelStyle: 'caps',
    items: [shortcutRow('listen', 'Listening on or off', ['⌥', 'R'])],
  },
  {
    id: 'view',
    label: 'View',
    labelStyle: 'caps',
    items: [
      shortcutRow('see-through', 'See-through on or off', ['⌘', '⇧', 'I']),
      shortcutRow('show-hide', 'Show or hide', ['⌘', '⇧', 'V']),
      shortcutRow('focus-chat', 'Focus chat', ['⌘', '⇧', 'C']),
    ],
  },
  {
    id: 'style',
    label: 'Answer style',
    labelStyle: 'caps',
    items: [shortcutRow('prev-next', 'Previous / next', ['⌘↑', ' ', '⌘↓'])],
  },
  {
    id: 'app',
    label: 'App',
    labelStyle: 'caps',
    items: [shortcutRow('settings', 'Settings', ['⌘', ',']), shortcutRow('clear', 'Clear session memory', ['⌘', '⇧', '\\'], 'danger')],
  },
];

/** The spec parts of each board-1c menu, without a trigger (so a SplitButton or a Button can host it). */
export type ActionMenuSpec = Omit<ActionMenuProps, 'trigger'>;

const noop = () => undefined;

export const screenPermissionNotice = (onSelect: () => void = noop): ActionMenuNotice => ({
  tone: 'warning',
  title: 'Screen recording permission missing',
  detail: 'Open System Settings to allow it',
  action: { label: 'Open System Settings', onSelect },
});

export const micLostNotice = (onSelect: () => void = noop, attempt = 2): ActionMenuNotice => ({
  tone: 'warning',
  title: 'Microphone lost',
  detail: `Trying again · attempt ${attempt}`,
  action: { label: 'Retry now', onSelect },
});

/** Capture caret menu (When to analyse + Display), optionally leading with the permission notice. */
export const captureMenuSpec = (mode: CaptureMode = 'manual', display = 'follow', notice?: ActionMenuNotice): ActionMenuSpec => ({
  label: 'Capture options',
  width: 320,
  notice,
  sections: captureMenuSections(mode, display),
});

/** Microphone caret menu (devices + Stop listening), optionally leading with the lost notice. */
export const micMenuSpec = (device = 'macbook', notice?: ActionMenuNotice): ActionMenuSpec => ({
  label: 'Microphone options',
  width: 300,
  notice,
  sections: [micDevicesSection(device), stopListening],
});

/** Answer-style menu: grouped, check column, hint row. */
export const answerStyleMenuSpec = (value = 'dsa'): ActionMenuSpec => ({
  label: 'Answer style',
  title: 'Answer style for new work',
  width: 290,
  sections: answerStyleSections(value),
  hint: { label: 'Previous / next', keys: ['⌘↑', '⌘↓'] },
});

export const captureModeMenu = captureMenuSpec();
export const screenPermissionMenu = captureMenuSpec('manual', 'follow', screenPermissionNotice());
export const micMenu = micMenuSpec();
export const micLostMenu = micMenuSpec('macbook', micLostNotice());
export const answerStyleMenu = answerStyleMenuSpec();
export const shortcutsMenu: ActionMenuSpec = { label: 'Keyboard shortcuts', kind: 'list', width: 300, sections: shortcutSections };

/** Build `<ActionMenu>` props for standalone stories and tests (a plain button is the default trigger). */
export const actionMenuPropsFactory = (overrides: Partial<ActionMenuProps> = {}): ActionMenuProps => ({
  trigger: <Button variant="outline">Open menu</Button>,
  ...captureModeMenu,
  ...overrides,
});

/** One entry per board-1c menu plus the behaviours worth showing side by side. */
export const actionMenuVariants: Variant<ActionMenuProps>[] = [
  { name: 'Capture: when to analyse + display', args: { ...captureModeMenu } },
  { name: 'Screen permission notice', args: { ...screenPermissionMenu } },
  { name: 'Microphone lost notice', args: { ...micLostMenu } },
  { name: 'Answer style (grouped, hint row)', args: { ...answerStyleMenu } },
  { name: 'Shortcuts (read-only list)', args: { ...shortcutsMenu } },
  { name: 'Scrolling (max height 160)', args: { ...answerStyleMenu, maxHeight: 160 } },
];
