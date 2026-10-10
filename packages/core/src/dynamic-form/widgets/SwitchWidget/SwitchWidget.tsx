import { SwitchPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { schemaRequiresTrueValue } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { widgetField } from '../../lib/widgetKit';

/** `switch`: a boolean as a toggle. Same value as `checkbox`; the label is the field's. */
export const SwitchWidget = (props: WidgetProps) => {
  const { onChange } = useStableRjsfCallbacks<boolean>(props, (next) => next);
  return (
    <SwitchPrimitive
      {...widgetField(props)}
      checked={Boolean(props.value)}
      required={schemaRequiresTrueValue(props.schema)}
      onChange={onChange}
    />
  );
};
