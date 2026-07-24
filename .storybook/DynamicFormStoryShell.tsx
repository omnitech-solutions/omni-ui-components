import * as React from 'react';

import { DynamicForm } from '@oc-tech/omni-ui-components/dynamic-form';
import { buildFormContext, EMPTY_FORM_CONTEXT_BASE } from '@oc-tech/omni-ui-components/dynamic-form/lib/formContext';
import type { FormError } from '@oc-tech/omni-ui-components';
import type { DynamicFormFixture, FormFixture } from 'factories/dynamic-form/DynamicForm/DynamicForm.factories';
export type { FormFixture, DynamicFormFixture };

const EMPTY_DERIVE = () => ({});

const isDynamicFormFixture = <T,>(
  fixture: FormFixture<T> | DynamicFormFixture<T & Record<string, unknown>>,
): fixture is DynamicFormFixture<T & Record<string, unknown>> => typeof (fixture as DynamicFormFixture<T & Record<string, unknown>>).derive === 'function';

export interface DynamicFormStoryShellProps<TFormData> {
  fixture: FormFixture<TFormData>;
  title: string;
  formData?: TFormData;
  onSubmit?: (parsed: TFormData) => void | Promise<void>;
  onError?: (errors: FormError[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  submitLabel?: string;
  /** Auto-click Submit on mount — used by ValidationErrors / ApiError stories. */
  autoSubmit?: boolean;
  /** Show the last submitted payload below the form. Default `true`. */
  showSubmitted?: boolean;
  /** Show the last error list below the form. Default `true`. */
  showErrors?: boolean;
}

/**
 * Story shell wrapping {@link DynamicForm} with card chrome, heading, submit
 * row, and submitted / errors debug panels. Mirrors `FormStoryShell` so
 * `omni-ui-components/Form` vs. `dynamic-form/DynamicForm` stories share
 * one chrome. All styling lives here — story files stay declarative.
 */
export function DynamicFormStoryShell<TFormData>({
  fixture,
  title,
  formData,
  onSubmit,
  onError,
  disabled,
  readOnly,
  submitLabel,
  autoSubmit,
  showSubmitted = true,
  showErrors = true,
}: DynamicFormStoryShellProps<TFormData>) {
  /* The submit button is only rendered when `submitLabel` is explicitly set
   * (or `autoSubmit` is true so the play effect has something to click). */
  const resolvedSubmitLabel = submitLabel ?? (autoSubmit ? 'Submit' : undefined);
  const [submitted, setSubmitted] = React.useState<TFormData | null>(null);
  const [errors, setErrors] = React.useState<FormError[]>([]);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  /* Controlled formData so the shell can recompute `derive(formData)` on
   * every change. RJSF onChange flows through `DynamicForm.onChange` →
   * here → re-render with new derived values in `formContext`. */
  const [controlledFormData, setControlledFormData] = React.useState<TFormData>(() => (formData ?? fixture.defaults) as TFormData);
  React.useEffect(() => {
    if (formData !== undefined) setControlledFormData(formData);
  }, [formData]);

  const dynamicFixture = isDynamicFormFixture(fixture) ? fixture : null;
  const derive = (dynamicFixture?.derive ?? EMPTY_DERIVE) as (data: Readonly<Partial<TFormData>>) => Record<string, unknown>;
  const formContextBase = dynamicFixture?.formContext ?? EMPTY_FORM_CONTEXT_BASE;
  const composedFormContext = React.useMemo(
    () => buildFormContext(formContextBase as never, derive(controlledFormData as Readonly<Partial<TFormData>>)),
    [controlledFormData, derive, formContextBase],
  );

  React.useEffect(() => {
    if (!autoSubmit) return;
    const submit = containerRef.current?.querySelector<HTMLButtonElement>('button[type="submit"]');
    const id = window.setTimeout(() => submit?.click(), 50);
    return () => window.clearTimeout(id);
  }, [autoSubmit]);

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-2xl">
      {showErrors && errors.length ? (
        <section data-testid="errors" className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs">
          <h3 className="mb-2 text-sm font-semibold text-destructive">Validation errors ({errors.length})</h3>
          <ul className="divide-y divide-destructive/20 font-mono">
            {errors.map((e, i) => (
              <li key={i} className="flex items-baseline gap-3 py-1">
                <span className="min-w-[8rem] shrink-0 font-semibold text-destructive">{e.path.length ? e.path.join('.') : '(form)'}</span>
                <span className="flex-1 text-destructive/90">{e.message}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {showSubmitted && submitted ? (
        <section data-testid="submitted" className="mb-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs">
          <h3 className="mb-2 text-sm font-semibold text-emerald-300">Submitted payload</h3>
          <pre className="font-mono text-emerald-200/90">{JSON.stringify(submitted, null, 2)}</pre>
        </section>
      ) : null}
      <div className="mx-auto w-full max-w-2xl rounded-lg border border-border bg-card p-8 shadow-lg">
        <h2 className="mb-6 text-xl font-semibold text-foreground">{title}</h2>
        <DynamicForm
          schema={fixture.schema}
          uiSchema={fixture.uiSchema}
          zodSchema={fixture.zodSchema as never}
          formData={controlledFormData as Record<string, unknown>}
          formContext={composedFormContext}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(next) => setControlledFormData(next as TFormData)}
          onSubmit={async (parsed) => {
            setErrors([]);
            setSubmitted(parsed as TFormData);
            await onSubmit?.(parsed as TFormData);
          }}
          onError={(errs) => {
            setSubmitted(null);
            setErrors(errs);
            onError?.(errs);
          }}
        >
          {resolvedSubmitLabel ? (
            <div className="mt-6 flex justify-end border-t border-border pt-6">
              <button
                type="submit"
                disabled={disabled || readOnly}
                className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {resolvedSubmitLabel}
              </button>
            </div>
          ) : null}
        </DynamicForm>
      </div>
    </div>
  );
}
