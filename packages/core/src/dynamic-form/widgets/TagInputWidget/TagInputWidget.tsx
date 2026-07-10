import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';

import { TagInputPrimitive } from '@omnitech/omni-ui-core';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/** RJSF TagInput widget — chip-based multi-string input. */
export const TagInputWidget = (props: WidgetProps) => {
  const { id, value, disabled, readonly, rawErrors, required, placeholder, options } = props;
  const { onChange } = useStableRjsfCallbacks<string[]>(props, (next) => next);
  return (
    <TagInputPrimitive
      id={id}
      value={Array.isArray(value) ? (value as string[]) : []}
      placeholder={placeholder}
      maxItems={(options?.maxItems as number | undefined) ?? undefined}
      required={required}
      disabled={disabled || readonly}
      invalid={Boolean(rawErrors?.length)}
      onChange={onChange}
    />
  );
};
