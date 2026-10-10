import { PasswordInputPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { booleanOption, stringOption, widgetField, widgetLook } from '../../lib/widgetKit';

/**
 * `password`: a password box with its reveal control. `ui:options.toggleable: false` draws the bare box;
 * `ui:options.autocomplete` is `current-password` (default) or `new-password`.
 */
export const PasswordWidget = (props: WidgetProps) => {
  const { value, placeholder, options, schema, autofocus } = props;
  const { onChange, onBlur, onFocus } = useStableRjsfCallbacks<string>(props);
  return (
    <PasswordInputPrimitive
      {...widgetField(props)}
      {...widgetLook(props)}
      toggleable={booleanOption(options, 'toggleable') ?? true}
      autoComplete={stringOption(options, 'autocomplete') ?? 'current-password'}
      value={(value as string | undefined) ?? ''}
      placeholder={placeholder as string | undefined}
      maxLength={schema.maxLength as number | undefined}
      autoFocus={autofocus}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
    />
  );
};
