import { type AutoCompleteOption, AutoCompletePrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import * as React from 'react';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { formContextOf, stringOption, widgetField, widgetLook } from '../../lib/widgetKit';

/**
 * `autocomplete`: free text with suggestions. A value outside the suggestions is valid: use `select` when it
 * must be one of a list. Suggestions come from the schema's `examples`, or with `ui:options.optionSetKey` from
 * `formContext.optionSets` (a list the host loads).
 */
export const AutoCompleteWidget = (props: WidgetProps) => {
  const { value, placeholder, options, schema } = props;
  const { onChange, onBlur, onFocus } = useStableRjsfCallbacks<string>(props);
  const setKey = stringOption(options, 'optionSetKey');
  const set = setKey ? formContextOf(props).optionSets?.[setKey] : undefined;
  const suggestions: AutoCompleteOption[] = React.useMemo(
    () =>
      set
        ? set.map((option) => ({
            value: option.value,
            label: option.label,
            disabled: option.disabled,
          }))
        : (Array.isArray(schema.examples) ? schema.examples : []).map((example) => ({
            value: String(example),
          })),
    [set, schema.examples],
  );
  return (
    <AutoCompletePrimitive
      {...widgetField(props)}
      {...widgetLook(props)}
      options={suggestions}
      value={(value as string | undefined) ?? ''}
      placeholder={stringOption(options, 'placeholder') ?? (placeholder || undefined)}
      maxLength={schema.maxLength as number | undefined}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
    />
  );
};
