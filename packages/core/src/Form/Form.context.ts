import * as React from 'react';

/**
 * Internal context bridging {@link Form} root to descendant {@link FormField}
 * consumers. Carries the TanStack form instance plus Omni-level disabled /
 * readOnly state so fields don't need to re-derive them.
 */
export interface OmniFormContextValue {
  form: any; // ReactFormApi from @tanstack/react-form (kept untyped to avoid generic explosion in consumers)
  disabled: boolean;
  readOnly: boolean;
}

export const FormContext = React.createContext<OmniFormContextValue | null>(null);
FormContext.displayName = 'OmniFormContext';

/** Hook used by descendants that need direct access to the underlying TanStack form. */
export const useFormContext = (): OmniFormContextValue => {
  const ctx = React.useContext(FormContext);
  if (!ctx) throw new Error('useFormContext must be called inside <Form>.');
  return ctx;
};
