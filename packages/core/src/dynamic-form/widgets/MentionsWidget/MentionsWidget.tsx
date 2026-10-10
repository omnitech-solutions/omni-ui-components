import { type MentionsOption, MentionsPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import * as React from 'react';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import {
  formContextOf,
  numberOption,
  sizeOf,
  stringOption,
  variantOf,
  widgetField,
} from '../../lib/widgetKit';

/**
 * `mentions`: several lines of text in which a trigger character offers a list of names; the stored value is
 * the plain text. The names are `formContext.optionSets[ui:options.optionSetKey]`. `ui:options.trigger`
 * (default `@`, a string or a list of strings) and `rows`.
 */
export const MentionsWidget = (props: WidgetProps) => {
  const { value, placeholder, options, schema } = props;
  const { onChange, onBlur, onFocus } = useStableRjsfCallbacks<string>(props);
  const setKey = stringOption(options, 'optionSetKey');
  const set = setKey ? formContextOf(props).optionSets?.[setKey] : undefined;
  const people: MentionsOption[] = React.useMemo(
    () =>
      (set ?? []).map((option) => ({
        value: option.value,
        label: option.label,
        description: option.description ?? undefined,
        disabled: option.disabled,
      })),
    [set],
  );
  const trigger = options?.trigger;
  const variant = variantOf(props);
  return (
    <MentionsPrimitive
      {...widgetField(props)}
      variant={variant === 'panel' ? undefined : variant}
      textareaSize={sizeOf(props)}
      options={people}
      trigger={
        typeof trigger === 'string' || Array.isArray(trigger) ? (trigger as string | string[]) : '@'
      }
      rows={numberOption(options, 'rows') ?? 3}
      value={(value as string | undefined) ?? ''}
      placeholder={placeholder || undefined}
      maxLength={schema.maxLength as number | undefined}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
    />
  );
};
