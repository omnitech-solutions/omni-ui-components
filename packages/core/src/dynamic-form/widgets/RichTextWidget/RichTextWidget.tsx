import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';

import { RichTextPrimitive } from '@oc-tech/omni-ui-components';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/** RJSF RichText widget for HTML string values. */
export const RichTextWidget = (props: WidgetProps) => {
  const { id, value, disabled, readonly, rawErrors, required, placeholder } = props;
  const { onChange } = useStableRjsfCallbacks<string>(props, (next) => next);
  return (
    <RichTextPrimitive
      id={id}
      value={(value as string | undefined) ?? ''}
      placeholder={placeholder}
      required={required}
      disabled={disabled || readonly}
      invalid={Boolean(rawErrors?.length)}
      onChange={onChange}
    />
  );
};
