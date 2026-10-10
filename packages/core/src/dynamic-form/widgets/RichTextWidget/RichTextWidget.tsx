import { RichTextPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { widgetField, widgetGroupName } from '../../lib/widgetKit';

/** `richText`: formatted text, stored as an HTML string. */
export const RichTextWidget = (props: WidgetProps) => {
  const { value, placeholder } = props;
  const { onChange } = useStableRjsfCallbacks<string>(props, (next) => next);
  return (
    <RichTextPrimitive
      {...widgetField(props)}
      {...widgetGroupName(props)}
      value={(value as string | undefined) ?? ''}
      placeholder={placeholder}
      onChange={onChange}
    />
  );
};
