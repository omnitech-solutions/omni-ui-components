import { TextareaPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { numberOption, sizeOf, variantOf, widgetField } from '../../lib/widgetKit';

/** `textarea`: several lines of text. `ui:options.rows` (default 5). */
export const TextareaWidget = (props: WidgetProps) => {
  const { value, placeholder, options, schema, autofocus } = props;
  const { onChange, onBlur, onFocus } = useStableRjsfCallbacks<string>(props);
  const variant = variantOf(props);

  return (
    <TextareaPrimitive
      {...widgetField(props)}
      // A textarea has no `panel` look: it falls back to the default.
      variant={variant === 'panel' ? undefined : variant}
      textareaSize={sizeOf(props)}
      value={(value as string | undefined) ?? ''}
      placeholder={(placeholder as string | undefined) ?? (schema.title as string | undefined)}
      maxLength={schema.maxLength as number | undefined}
      rows={numberOption(options, 'rows') ?? 5}
      autoFocus={autofocus}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
    />
  );
};
