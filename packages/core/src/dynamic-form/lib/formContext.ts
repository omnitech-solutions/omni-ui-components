/**
 * Omni-owned RJSF formContext contract.
 *
 * `formContext` is RJSF's per-render bag passed to every widget and template.
 * Omni uses it as a typed surface for fixture-supplied data that is NOT
 * canonical form data — option sets resolved at story / app level, derived
 * display values computed from `formData`, and named actions widgets can
 * reference by id (footer links, label-row actions, etc.).
 *
 * Two invariants:
 *   1. `formContext.derived` is a pure function of current `formData` plus
 *      fixture context. Widgets read it; they never write to it.
 *   2. Nothing in `formContext` is part of the submitted payload. Submit
 *      flows through Zod on `formData` alone.
 */

import type * as React from 'react';

export interface OmniSelectOption {
  value: string;
  label: string;
  description: string | null;
  avatarUrl: string | null;
  initials: string | null;
  color: string | null;
  group: string | null;
  disabled: boolean;
}

/**
 * A named action a widget or template can point at by key (`formContext.actions[key]`). The schema names the key;
 * the host supplies everything that is not data: where it goes and what it does. The library never navigates:
 * with `href` it draws a link element, with `onSelect` it calls the host, with neither it draws plain text.
 */
export interface OmniRjsfAction {
  label: string;
  href: string | null;
  actionId: string;
  /** Called with this action (by reference) when the person activates it. The host routes, opens or saves. */
  onSelect?: (action: OmniRjsfAction) => void;
  /** Icon node for controls that draw one (`iconToolbar`). Icons are nodes, never names in a schema. */
  icon?: React.ReactNode;
}

/** A node of a tree a widget reads by key from `formContext.optionTrees` (`cascader`, `treeSelect`). */
export interface OmniTreeOption {
  value: string;
  label: string;
  disabled?: boolean;
  children?: OmniTreeOption[];
}

export type OmniStatusTone = 'success' | 'warning' | 'danger' | 'muted';

/** A status shown beside a field's label or a section's title: a toned dot and its words. Plain data. */
export interface OmniStatus {
  tone: OmniStatusTone;
  /** What the dot means, for everyone: drawn beside it. */
  label: string;
}

/** The host's say over one section (an object of the schema), by its key (`contact`, `billing.address`). */
export interface OmniSectionState {
  /** Controlled open state of a collapsible section. Absent: the section keeps its own. */
  open?: boolean;
  /** Drawn at the end of the section's header: a count, a short note, any node the host supplies. */
  meta?: React.ReactNode;
  status?: OmniStatus;
}

/** Words the form's own templates and widgets draw. Every key is optional; the defaults are English. */
export interface OmniRjsfLabels {
  /** Assistive hint beside a required control whose role cannot carry `aria-required`. */
  required: string;
  /** Title of a collapsible section that has no title of its own. */
  section: string;
  /** The button that adds a row to an array. */
  addItem: string;
  /** `select` placeholder; `{title}` is replaced by the field's lower-cased title. */
  selectPlaceholder: string;
  /** `select` placeholder for a field with no title. */
  selectPlaceholderUntitled: string;
  /** `combobox` placeholder; `{title}` is replaced by the field's lower-cased title. */
  searchPlaceholder: string;
  /** `combobox` placeholder for a field with no title. */
  searchPlaceholderUntitled: string;
}

export const DEFAULT_DYNAMIC_FORM_LABELS: OmniRjsfLabels = {
  required: 'Required',
  section: 'Additional Fields',
  addItem: 'Add item',
  selectPlaceholder: 'Select {title}…',
  selectPlaceholderUntitled: 'Select…',
  searchPlaceholder: 'Find {title}…',
  searchPlaceholderUntitled: 'Search…',
};

export interface OmniCollapsibleOptions {
  title: string;
  defaultOpen: boolean;
}

export interface OmniRjsfFormContext<
  TDerived extends Record<string, unknown> = Record<string, unknown>,
> {
  derived: TDerived;
  optionSets: Record<string, OmniSelectOption[]>;
  actions: Record<string, OmniRjsfAction>;
  locale: string;
  /** Trees for `cascader` and `treeSelect`, read by `ui:options.optionTreeKey`. */
  optionTrees?: Record<string, OmniTreeOption[]>;
  /** Per section, by key: controlled open state, a header slot and a status. */
  sections?: Record<string, OmniSectionState>;
  /** A collapsible section was opened or closed by the person. Controlled sections change only when the host answers. */
  onSectionOpenChange?: (key: string, open: boolean) => void;
  /** A status beside a field's label, by field key (`email`, `address.city`). */
  fieldStatus?: Record<string, OmniStatus>;
  /** Icon nodes a widget reads by key (`stepper` with `ui:options.iconKey`). Icons are nodes, never names in a schema. */
  icons?: Record<string, React.ReactNode>;
  /** Model lists for `modelPicker`, read by `ui:options.modelSetKey`. Each entry is the chat `ModelInfo`. */
  modelSets?: Record<string, { id: string; name: string }[]>;
  /** Words drawn by the form's templates and widgets; merged over {@link DEFAULT_DYNAMIC_FORM_LABELS}. */
  labels?: Partial<OmniRjsfLabels>;
}

/**
 * Compose the per-render formContext from the fixture's static parts and the
 * just-derived view model. Kept as a tiny helper so `DynamicForm`, the
 * Storybook shell, and tests all build the same shape the same way.
 */
export const buildFormContext = <TDerived extends Record<string, unknown>>(
  base: Omit<OmniRjsfFormContext<TDerived>, 'derived'>,
  derived: TDerived,
): OmniRjsfFormContext<TDerived> => ({
  ...base,
  derived,
});

export const EMPTY_FORM_CONTEXT_BASE: Omit<
  OmniRjsfFormContext<Record<string, unknown>>,
  'derived'
> = {
  optionSets: {},
  actions: {},
  locale: 'en',
};

/** One cell of a `ui:rows` row: a field name, or a field with the number of columns it spans. */
export type OmniRowItem = string | { value: string; span?: number };

/** The options every field reads from `ui:options` (and the whole form from `ui:globalOptions`). Plain data. */
export interface OmniFieldUiOptions {
  size?: 'sm' | 'default' | 'md' | 'lg';
  variant?: 'bordered' | 'panel' | 'ghost';
  layout?: 'vertical' | 'horizontal';
  labelActionKey?: string;
  placeholder?: string;
  [option: string]: unknown;
}

/**
 * The uiSchema as this library reads it. RJSF's own `UiSchema` types `ui:rows` for its textarea; here it is the
 * object layout (`[['first', 'last'], [{ value: 'notes', span: 2 }]]`), so a host needs no widening cast.
 * Nested objects carry the same shape.
 */
export interface OmniUiSchema {
  'ui:rows'?: OmniRowItem[][];
  'ui:options'?: OmniFieldUiOptions;
  'ui:globalOptions'?: OmniFieldUiOptions;
  'ui:widget'?: string;
  'ui:field'?: string;
  // biome-ignore lint/suspicious/noExplicitAny: a uiSchema is open by design (RJSF keys, nested fields).
  [key: string]: any;
}
