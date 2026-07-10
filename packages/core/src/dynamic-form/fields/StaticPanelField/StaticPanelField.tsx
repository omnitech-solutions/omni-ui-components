import * as React from 'react';
import type { FieldProps } from '@rjsf/utils';

import type { OmniRjsfFormContext } from '../../lib/formContext';

/**
 * Non-input RJSF field for arbitrary display content rendered inside a
 * form (timer header, "Saved 2m ago" banner, summary panels). The
 * field reads display content from `formContext.derived[panelKey]`
 * (string) or `formContext.actions` for label/href panels. It never
 * writes to `formData`; the schema property should be marked
 * `readOnly: true` and is not part of the submit payload.
 *
 * Two render modes:
 *   - `ui:options.panelKey`  → render `formContext.derived[panelKey]`
 *     as a single block; nice for "12h 21m 32s" timers.
 *   - `ui:options.lines`     → render an array of derived keys as
 *     stacked lines (heading + subheading + status chip).
 */
export const StaticPanelField = (props: FieldProps) => {
  const { idSchema, uiSchema, registry, name } = props;
  const fromIdSchema = (idSchema as { $id?: string } | undefined)?.$id;
  const id = fromIdSchema && fromIdSchema.length > 0 ? fromIdSchema : name ? `root_${name}` : 'static-panel';
  const uiOptions = (uiSchema as unknown as { 'ui:options'?: Record<string, unknown> } | undefined)?.['ui:options'] ?? {};
  const panelKey = typeof uiOptions['panelKey'] === 'string' ? (uiOptions['panelKey'] as string) : '';
  const lines = Array.isArray(uiOptions['lines']) ? (uiOptions['lines'] as string[]) : [];

  const context = (registry?.formContext ?? {}) as Partial<OmniRjsfFormContext>;
  const derived = context.derived ?? {};

  return (
    <div data-testid={`${id}-static-panel`} className="flex flex-col gap-1">
      {panelKey ? (
        <div data-testid={`${id}-panel-${panelKey}`} className="text-2xl font-bold text-foreground">
          {String(derived[panelKey] ?? '')}
        </div>
      ) : null}
      {lines.map((key) => (
        <div key={key} data-testid={`${id}-panel-${key}`} className="text-sm text-muted-foreground">
          {String(derived[key] ?? '')}
        </div>
      ))}
    </div>
  );
};
