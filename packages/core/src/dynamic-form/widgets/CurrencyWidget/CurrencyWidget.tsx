import { CurrencyInputPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { formContextOf, stringOption, widgetField, widgetLook } from '../../lib/widgetKit';

/**
 * `currency`: an amount of money as a number; empty is `undefined`. `ui:options.currency` (default `USD`);
 * `ui:options.locale`, else the form's `formContext.locale`.
 */
export const CurrencyWidget = (props: WidgetProps) => {
  const { value, placeholder, options } = props;
  const { onChange } = useStableRjsfCallbacks<number | null>(props, (next) => next ?? undefined);
  return (
    <CurrencyInputPrimitive
      {...widgetField(props)}
      {...widgetLook(props)}
      value={typeof value === 'number' ? value : null}
      currency={stringOption(options, 'currency') ?? 'USD'}
      locale={stringOption(options, 'locale') ?? formContextOf(props).locale}
      placeholder={placeholder}
      onChange={onChange}
    />
  );
};
