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

export interface OmniRjsfAction {
  label: string;
  href: string | null;
  actionId: string;
}

export interface OmniCollapsibleOptions {
  title: string;
  defaultOpen: boolean;
}

export interface OmniRjsfFormContext<TDerived extends Record<string, unknown> = Record<string, unknown>> {
  derived: TDerived;
  optionSets: Record<string, OmniSelectOption[]>;
  actions: Record<string, OmniRjsfAction>;
  locale: string;
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

export const EMPTY_FORM_CONTEXT_BASE: Omit<OmniRjsfFormContext<Record<string, unknown>>, 'derived'> = {
  optionSets: {},
  actions: {},
  locale: 'en',
};
