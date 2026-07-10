import * as React from 'react';

import { FormDemo, type FormDemoProps } from './FormDemo';
import type { FormError } from '@omnitech/omni-ui-core/Form/Form.types';

export interface FormStoryShellProps<TFormData> extends FormDemoProps<TFormData> {
  /** Show the last submitted value in a debug pane. Default `true`. */
  showSubmitted?: boolean;
  /** Show the last error list in a debug pane. Default `true`. */
  showErrors?: boolean;
  /** Auto-click Submit on mount — used by ValidationErrors / ApiError stories. */
  autoSubmit?: boolean;
}

/**
 * Story shell wrapping {@link FormDemo} with card chrome (heading + bordered
 * card) and two debug panels (submitted / errors). Story files stay a one-line
 * config; all styling lives here.
 */
export function FormStoryShell<TFormData>(props: FormStoryShellProps<TFormData>) {
  const { fixture, showSubmitted = true, showErrors = true, autoSubmit, ...demoProps } = props;
  const [submitted, setSubmitted] = React.useState<TFormData | null>(null);
  const [errors, setErrors] = React.useState<FormError[]>([]);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!autoSubmit) return;
    const submit = containerRef.current?.querySelector<HTMLButtonElement>('button[type="submit"]');
    const id = window.setTimeout(() => submit?.click(), 50);
    return () => window.clearTimeout(id);
  }, [autoSubmit]);
  return (
    <div ref={containerRef} className={`mx-auto w-full ${fixture.maxWidth ?? 'max-w-2xl'}`}>
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
          <ul className="divide-y divide-emerald-500/20 font-mono">
            {Object.entries(submitted as Record<string, unknown>).map(([k, v]) => (
              <li key={k} className="flex items-baseline gap-3 py-1">
                <span className="min-w-[8rem] shrink-0 font-semibold text-emerald-300">{k}</span>
                <span className="flex-1 text-emerald-200/90">{JSON.stringify(v)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <div className={`mx-auto w-full ${fixture.maxWidth ?? 'max-w-2xl'} rounded-lg border border-border bg-card p-8 shadow-lg`}>
        {fixture.title ? <h2 className="mb-6 text-xl font-semibold text-foreground">{fixture.title}</h2> : null}
        <FormDemo
          fixture={fixture}
          {...demoProps}
          onSubmit={async (v) => {
            setErrors([]);
            setSubmitted(v as TFormData);
            await demoProps.onSubmit?.(v);
          }}
          onError={(errs) => {
            setSubmitted(null);
            setErrors(errs);
            demoProps.onError?.(errs);
          }}
        />
      </div>
    </div>
  );
}
