import { type RadioOption, RadioPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { choicesOf, widgetField, widgetGroupName } from '../../lib/widgetKit';

/** `radio`: one choice, every option visible. `ui:options.inline`, `optionDescriptions`, `enumDisabled`, and `appearance: 'card'` for selectable cards. */
export const RadioWidget = (props: WidgetProps) => {
  const { value, options } = props;
  const { onChange, onBlur, onFocus } = useStableRjsfCallbacks<string>(props, (next) => next);
  return (
    <RadioPrimitive
      {...widgetField(props)}
      {...widgetGroupName(props)}
      options={choicesOf(props) as RadioOption[]}
      orientation={options?.inline ? 'horizontal' : 'vertical'}
      appearance={options?.appearance === 'card' ? 'card' : 'plain'}
      value={(value as string | undefined) ?? undefined}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
    />
  );
};
