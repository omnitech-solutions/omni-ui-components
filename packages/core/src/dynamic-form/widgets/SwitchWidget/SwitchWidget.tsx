import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';
import { schemaRequiresTrueValue } from '@rjsf/utils';

import { SwitchPrimitive } from '@oc-tech/omni-ui-components';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/** RJSF Switch widget for boolean schemas. */
export const SwitchWidget = (props: WidgetProps) => {
  const { id, value, disabled, readonly, rawErrors, schema } = props;
  const { onChange } = useStableRjsfCallbacks<boolean>(props, (next) => next);
  const required = schemaRequiresTrueValue(schema);
  return (
    <SwitchPrimitive
      id={id}
      checked={Boolean(value)}
      required={required}
      disabled={disabled || readonly}
      invalid={Boolean(rawErrors?.length)}
      onChange={onChange}
    />
  );
};
