import { CheckboxGroupPrimitive, type CheckboxOption } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import * as React from 'react';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { choicesOf, widgetField, widgetGroupName } from '../../lib/widgetKit';

/** `checkboxes`: several choices, every option visible. `ui:options.inline`, `optionDescriptions`, `enumDisabled`. */
export const CheckboxesWidget = (props: WidgetProps) => {
  const { value, options } = props;
  const { onChange, onBlur, onFocus } = useStableRjsfCallbacks<string[]>(props, (next) => next);
  const valueArray = React.useMemo(
    () => (Array.isArray(value) ? (value as unknown[]).map(String) : []),
    [value],
  );
  return (
    <CheckboxGroupPrimitive
      {...widgetField(props, { requiredHint: true })}
      {...widgetGroupName(props)}
      options={choicesOf(props) as CheckboxOption[]}
      orientation={options?.inline ? 'horizontal' : 'vertical'}
      value={valueArray}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
    />
  );
};
