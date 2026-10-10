import { type SegmentedOption, SegmentedPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { choicesOf, widgetField, widgetGroupName } from '../../lib/widgetKit';

/**
 * `segmented`: a row of toggles. The schema type picks the mode: a string stores one choice, an array of choices
 * (`uniqueItems`) stores several, and its `minItems` is the fewest that must stay on.
 * `ui:options.appearance: 'pill' | 'control'`.
 */
export const SegmentedWidget = (props: WidgetProps) => {
  const { value, options, schema } = props;
  const { onChange } = useStableRjsfCallbacks<string | string[]>(props, (next) => next);
  const shared = {
    ...widgetField(props),
    ...widgetGroupName(props),
    options: choicesOf(props) as SegmentedOption[],
    appearance: options?.appearance === 'control' ? ('control' as const) : ('pill' as const),
  };
  return schema.type === 'array' ? (
    <SegmentedPrimitive
      {...shared}
      mode="multiple"
      minActive={schema.minItems ?? 0}
      value={Array.isArray(value) ? (value as unknown[]).map(String) : []}
      onChange={onChange}
    />
  ) : (
    <SegmentedPrimitive
      {...shared}
      value={(value as string | undefined) ?? undefined}
      onChange={onChange}
    />
  );
};
