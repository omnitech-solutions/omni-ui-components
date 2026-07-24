import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';

import { InputPrimitive } from '@oc-tech/omni-ui-components';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/**
 * RJSF Text widget. Renders only the input chrome — label, description,
 * required marker and error rows are owned by the surrounding FieldTemplate.
 *
 * Recognized `ui:options`:
 * - `commitOnEnter` — blur the input on Enter/Escape.
 * - `emptyValue`   — value substituted when the user clears the field.
 */
const resolveInputType = (props: WidgetProps): string => {
  const { type, schema, options } = props;
  if (typeof options?.inputType === 'string') return options.inputType;
  if (typeof type === 'string' && type) return type;
  switch (schema.format) {
    case 'email':
      return 'email';
    case 'uri':
    case 'url':
      return 'url';
    case 'date':
      return 'date';
    case 'date-time':
      return 'datetime-local';
    case 'time':
      return 'time';
    default:
      return 'text';
  }
};

export const TextWidget = (props: WidgetProps) => {
  const { id, value, required, disabled, readonly, placeholder, rawErrors, options, schema } = props;
  const inputType = resolveInputType(props);
  const { onChange, onBlur, onFocus } = useStableRjsfCallbacks<string>(props);

  return (
    <InputPrimitive
      id={id}
      type={inputType}
      value={(value as string | undefined) ?? ''}
      placeholder={(placeholder as string | undefined) ?? (schema.title as string | undefined)}
      required={required}
      disabled={disabled}
      readOnly={readonly}
      invalid={Boolean(rawErrors?.length)}
      maxLength={schema.maxLength as number | undefined}
      commitOnEnter={Boolean(options?.commitOnEnter)}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
    />
  );
};
