import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';

import type { OmniRjsfFormContext } from '../../lib/formContext';

/**
 * Read-only RJSF widget that renders a string from
 * `formContext.derived[derivedKey]` instead of from `formData`. Use it
 * to surface computed display values (Excluding Tax, Sales Price,
 * counts, formatted dates) without writing them back into the
 * canonical submit payload.
 *
 * The widget never reads or writes `formData`; the underlying schema
 * property can be omitted from the parent object (the widget will
 * still render) or kept as a no-op string with `readOnly: true`.
 */
export type DerivedTextTone = 'default' | 'muted' | 'success' | 'danger';

interface DerivedTextWidgetOptions {
  derivedKey: string;
  tone: DerivedTextTone;
}

const readOptions = (raw: WidgetProps['options']): DerivedTextWidgetOptions => ({
  derivedKey: typeof raw.derivedKey === 'string' ? raw.derivedKey : '',
  tone: raw.tone === 'muted' || raw.tone === 'success' || raw.tone === 'danger' ? raw.tone : 'default',
});

const TONE_CLASS: Record<DerivedTextTone, string> = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  success: 'text-emerald-500',
  danger: 'text-destructive',
};

export const DerivedTextWidget = (props: WidgetProps) => {
  const { id, options, registry } = props;
  const parsed = readOptions(options);
  const context = (registry?.formContext ?? {}) as Partial<OmniRjsfFormContext<Record<string, unknown>>>;
  const derived = context.derived ?? {};
  const rawValue = parsed.derivedKey ? derived[parsed.derivedKey] : '';
  const text = typeof rawValue === 'string' ? rawValue : '';

  return (
    <div data-testid={`${id}-derived`} className={`text-sm font-semibold ${TONE_CLASS[parsed.tone]}`}>
      {text}
    </div>
  );
};
