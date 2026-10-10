import { MultiSelectPrimitive, type SelectOption } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { choicesOf, widgetField, widgetLook } from '../../lib/widgetKit';

/** `multiSelect`: several choices from a list, as chips. `maxItems` comes from the schema. */
export const MultiSelectWidget = (props: WidgetProps) => {
  const { value, placeholder, options, schema } = props;
  const { onChange } = useStableRjsfCallbacks<string[]>(props, (next) => next);
  return (
    <MultiSelectPrimitive
      {...widgetField(props, { requiredHint: true })}
      {...widgetLook(props)}
      options={choicesOf(props) as SelectOption[]}
      value={Array.isArray(value) ? (value as unknown[]).map(String) : []}
      placeholder={placeholder}
      searchable={Boolean(options?.searchable)}
      maxItems={schema.maxItems}
      onChange={onChange}
    />
  );
};
