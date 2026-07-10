import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';

import { TextareaPrimitive } from '@omnitech/omni-ui-core';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/** RJSF Textarea widget. */
export const TextareaWidget = (props: WidgetProps) => {
  const { id, value, required, disabled, readonly, placeholder, rawErrors, options, schema, autofocus } = props;
  const { onChange, onBlur, onFocus } = useStableRjsfCallbacks<string>(props);
  const rows = typeof options?.rows === 'number' ? options.rows : 5;

  return (
    <TextareaPrimitive
      id={id}
      value={(value as string | undefined) ?? ''}
      placeholder={(placeholder as string | undefined) ?? (schema.title as string | undefined)}
      required={required}
      disabled={disabled}
      readOnly={readonly}
      invalid={Boolean(rawErrors?.length)}
      maxLength={schema.maxLength as number | undefined}
      rows={rows}
      autoFocus={autofocus}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
    />
  );
};
