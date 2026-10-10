import { PhoneInputPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { stringOption, widgetField, widgetLook } from '../../lib/widgetKit';

/** `phone`: a phone number as text. `ui:options.defaultDialCode`. */
export const PhoneWidget = (props: WidgetProps) => {
  const { value, placeholder, options } = props;
  const { onChange } = useStableRjsfCallbacks<string>(props, (next) => next);
  return (
    <PhoneInputPrimitive
      {...widgetField(props)}
      {...widgetLook(props)}
      value={(value as string | undefined) ?? ''}
      defaultDialCode={stringOption(options, 'defaultDialCode')}
      placeholder={placeholder}
      onChange={onChange}
    />
  );
};
