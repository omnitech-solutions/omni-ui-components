import { type CascaderOption, CascaderPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { booleanOption, stringOption, treeOf, widgetField, widgetLook } from '../../lib/widgetKit';

/**
 * `cascader`: a choice made level by level; the stored value is the PATH, an array of strings
 * (`['europe', 'france', 'paris']`). The tree is `formContext.optionTrees[ui:options.optionTreeKey]`, or plain
 * data in `ui:options.tree`. `ui:options.changeOnSelect` lets a branch be the answer; `displaySeparator`.
 */
export const CascaderWidget = (props: WidgetProps) => {
  const { value, placeholder, options, required } = props;
  const { onChange } = useStableRjsfCallbacks<string[]>(props, (next) =>
    next.length > 0 ? next : undefined,
  );
  return (
    <CascaderPrimitive
      {...widgetField(props)}
      {...widgetLook(props)}
      options={treeOf(props) as CascaderOption[]}
      value={Array.isArray(value) ? (value as unknown[]).map(String) : []}
      placeholder={stringOption(options, 'placeholder') ?? (placeholder || undefined)}
      changeOnSelect={booleanOption(options, 'changeOnSelect')}
      displaySeparator={stringOption(options, 'displaySeparator')}
      allowClear={!required}
      onChange={onChange}
    />
  );
};
