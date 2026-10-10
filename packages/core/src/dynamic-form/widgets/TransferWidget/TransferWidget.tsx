import { type TransferItem, TransferPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import * as React from 'react';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { booleanOption, choicesOf, widgetField, widgetGroupName } from '../../lib/widgetKit';

/**
 * `transfer`: several choices moved from one list to another; the stored value is the chosen keys, an array of
 * strings in the order they were moved. Same schema as `multiSelect` and `checkboxes` (an array of `enum` /
 * `oneOf`, or `ui:options.optionSetKey`); made for long lists. `ui:options.searchable`, `oneWay`.
 */
export const TransferWidget = (props: WidgetProps) => {
  const { value, options } = props;
  const { onChange } = useStableRjsfCallbacks<string[]>(props, (next) => next);
  const choices = choicesOf(props);
  const items: TransferItem[] = React.useMemo(
    () =>
      choices.map((choice) => ({
        key: choice.value,
        title: choice.label,
        description: choice.description ?? undefined,
        disabled: choice.disabled,
      })),
    [choices],
  );
  return (
    <TransferPrimitive
      {...widgetField(props)}
      {...widgetGroupName(props)}
      dataSource={items}
      targetKeys={Array.isArray(value) ? (value as unknown[]).map(String) : []}
      searchable={booleanOption(options, 'searchable')}
      oneWay={booleanOption(options, 'oneWay')}
      onChange={onChange}
    />
  );
};
