import { TagInputPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { numberOption, widgetField, widgetLook } from '../../lib/widgetKit';

/** `tags`: free words as chips. The most allowed: `ui:options.maxItems`, else the schema's `maxItems`. */
export const TagInputWidget = (props: WidgetProps) => {
  const { value, placeholder, options, schema } = props;
  const { onChange } = useStableRjsfCallbacks<string[]>(props, (next) => next);
  return (
    <TagInputPrimitive
      {...widgetField(props)}
      {...widgetLook(props)}
      value={Array.isArray(value) ? (value as string[]) : []}
      placeholder={placeholder}
      maxItems={numberOption(options, 'maxItems') ?? schema.maxItems}
      onChange={onChange}
    />
  );
};
