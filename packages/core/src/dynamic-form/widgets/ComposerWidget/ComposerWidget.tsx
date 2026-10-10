import { Composer } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { numberOption, widgetField } from '../../lib/widgetKit';

/**
 * `composer`: the chat message box as a form field; the stored value is the draft text. The form submits it,
 * so the box draws no send, attach or dictate control (each exists only with its callback, and a widget passes
 * none). Enter is a new line. `ui:options.appearance: 'stacked' | 'pill'`, `maxHeight` (px).
 */
export const ComposerWidget = (props: WidgetProps) => {
  const { value, placeholder, options } = props;
  const { onChange } = useStableRjsfCallbacks<string>(props);
  const field = widgetField(props);
  return (
    <Composer
      value={(value as string | undefined) ?? ''}
      onChange={onChange}
      placeholder={placeholder || undefined}
      disabled={field.disabled}
      sendOnEnter={false}
      variant={options?.appearance === 'pill' ? 'pill' : 'stacked'}
      maxHeight={numberOption(options, 'maxHeight')}
      textareaProps={{
        id: field.id,
        readOnly: field.readOnly,
        required: field.required,
        'aria-invalid': field.invalid || undefined,
        'aria-describedby': field['aria-describedby'],
      }}
    />
  );
};
