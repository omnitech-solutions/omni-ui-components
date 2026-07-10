import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';
import { schemaRequiresTrueValue } from '@rjsf/utils';

import { CheckboxPrimitive } from '@omnitech/omni-ui-core';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/** RJSF Checkbox widget for boolean schemas. */
export const CheckboxWidget = (props: WidgetProps) => {
  const { id, value, disabled, readonly, rawErrors, schema, autofocus } = props;
  const { onChange, onBlur, onFocus } = useStableRjsfCallbacks<boolean>(props, (next) => next);
  const required = schemaRequiresTrueValue(schema);

  return (
    <CheckboxPrimitive
      id={id}
      checked={Boolean(value)}
      required={required}
      disabled={disabled || readonly}
      invalid={Boolean(rawErrors?.length)}
      autoFocus={autofocus}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
    />
  );
};
