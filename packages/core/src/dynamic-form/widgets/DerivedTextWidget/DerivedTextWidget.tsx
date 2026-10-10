import type { WidgetProps } from '@rjsf/utils';
import { formContextOf, stringOption } from '../../lib/widgetKit';

export type DerivedTextTone = 'default' | 'muted' | 'success' | 'danger';

const TONE_CLASS: Record<DerivedTextTone, string> = {
  default: 'text-[var(--oui-foreground)]',
  muted: 'text-[var(--oui-foreground-muted)]',
  success: 'text-[color:var(--oui-tone-success-fg)]',
  danger: 'text-[var(--oui-border-invalid)]',
};

/**
 * `derivedText`: a line of text computed from the form's data. It reads
 * `formContext.derived[ui:options.derivedKey]`; it never reads or writes the form data and nothing is submitted.
 * `ui:options.tone: 'default' | 'muted' | 'success' | 'danger'`.
 */
export const DerivedTextWidget = (props: WidgetProps) => {
  const { id, options } = props;
  const key = stringOption(options, 'derivedKey');
  const tone = (stringOption(options, 'tone') ?? 'default') as DerivedTextTone;
  const raw = key ? formContextOf(props).derived?.[key] : '';
  return (
    <div
      id={id}
      data-testid={`${id}-derived`}
      data-slot="derived-text"
      className={`text-sm font-semibold ${TONE_CLASS[tone] ?? TONE_CLASS.default}`}
    >
      {typeof raw === 'string' ? raw : ''}
    </div>
  );
};
