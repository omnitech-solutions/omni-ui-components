import { ColorPickerPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { widgetField, widgetLook } from '../../lib/widgetKit';

/**
 * `color`: a colour, stored as `#rrggbb`. An empty field shows no colour of its own: the screen never shows a
 * value the data does not hold. `ui:options.presets: string[]` offers swatches.
 */
export const ColorWidget = (props: WidgetProps) => {
  const { value, options } = props;
  const { onChange } = useStableRjsfCallbacks<string>(props, (next) => next);
  return (
    <ColorPickerPrimitive
      {...widgetField(props)}
      {...widgetLook(props)}
      value={(value as string | undefined) ?? ''}
      presets={Array.isArray(options?.presets) ? (options.presets as string[]) : undefined}
      onChange={onChange}
    />
  );
};
