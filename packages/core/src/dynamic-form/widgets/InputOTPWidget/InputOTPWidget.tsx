import { InputOTPPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { numberOption, widgetField } from '../../lib/widgetKit';

/** `otp`: a one-time code, one box per character. Length: `ui:options.length`, else `maxLength`, else 6. */
export const InputOTPWidget = (props: WidgetProps) => {
  const { value, options, schema } = props;
  const { onChange } = useStableRjsfCallbacks<string>(props, (next) => next);
  return (
    <InputOTPPrimitive
      {...widgetField(props)}
      value={(value as string | undefined) ?? ''}
      length={numberOption(options, 'length') ?? (schema.maxLength as number | undefined) ?? 6}
      onChange={onChange}
    />
  );
};
