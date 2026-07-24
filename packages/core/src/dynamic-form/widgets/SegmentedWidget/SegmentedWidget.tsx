import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';

import { SegmentedPrimitive, type SegmentedOption } from '@oc-tech/omni-ui-components';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/** RJSF Segmented widget — single-select pill row. */
export const SegmentedWidget = (props: WidgetProps) => {
  const { id, value, required, disabled, readonly, rawErrors, options } = props;
  const { onChange } = useStableRjsfCallbacks<string>(props, (next) => next);

  const segmentedOptions: SegmentedOption[] = React.useMemo(() => {
    const enumOptions = (options?.enumOptions as { value: unknown; label: string }[] | undefined) ?? [];
    const enumDisabled = (options?.enumDisabled as unknown[] | undefined) ?? [];
    return enumOptions.map((opt) => ({
      value: String(opt.value),
      label: opt.label,
      disabled: enumDisabled.includes(opt.value),
    }));
  }, [options?.enumOptions, options?.enumDisabled]);

  return (
    <SegmentedPrimitive
      id={id}
      options={segmentedOptions}
      required={required}
      disabled={disabled || readonly}
      invalid={Boolean(rawErrors?.length)}
      value={(value as string | undefined) ?? undefined}
      onChange={onChange}
    />
  );
};
