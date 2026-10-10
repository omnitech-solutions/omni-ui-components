import { InputPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { stringOption, widgetField, widgetLook } from '../../lib/widgetKit';

/** `<input type>` and the keyboard and autofill hints that go with a JSON Schema `format`. */
const FORMAT_HINTS: Record<
  string,
  { type: string; inputMode?: 'email' | 'url'; autoComplete?: string }
> = {
  email: { type: 'email', inputMode: 'email', autoComplete: 'email' },
  uri: { type: 'url', inputMode: 'url', autoComplete: 'url' },
  url: { type: 'url', inputMode: 'url', autoComplete: 'url' },
  date: { type: 'date' },
  'date-time': { type: 'datetime-local' },
  time: { type: 'time' },
};

/**
 * `text`: one line of text, for every string-like schema. The input type, `inputMode` and `autocomplete` follow
 * `schema.format` (email, uri) and can be set with `ui:options.inputType`, `inputMode`, `autocomplete`.
 */
export const TextWidget = (props: WidgetProps) => {
  const { value, placeholder, options, schema, type, autofocus } = props;
  const hints = FORMAT_HINTS[String(schema.format ?? '')] ?? { type: 'text' };
  const { onChange, onBlur, onFocus } = useStableRjsfCallbacks<string>(props);

  return (
    <InputPrimitive
      {...widgetField(props)}
      {...widgetLook(props)}
      type={
        stringOption(options, 'inputType') ?? (typeof type === 'string' && type ? type : hints.type)
      }
      inputMode={(stringOption(options, 'inputMode') as 'text' | undefined) ?? hints.inputMode}
      autoComplete={stringOption(options, 'autocomplete') ?? hints.autoComplete}
      value={(value as string | undefined) ?? ''}
      placeholder={(placeholder as string | undefined) ?? (schema.title as string | undefined)}
      maxLength={schema.maxLength as number | undefined}
      commitOnEnter={Boolean(options?.commitOnEnter)}
      autoFocus={autofocus}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
    />
  );
};
