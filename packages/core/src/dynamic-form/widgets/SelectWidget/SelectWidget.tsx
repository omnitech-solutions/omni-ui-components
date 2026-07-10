import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';

import { SelectPrimitive, type SelectFooterAction, type SelectOption } from '@omnitech/omni-ui-core';
import { MultiSelectWidget } from '../MultiSelectWidget';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import type { OmniRjsfFormContext } from '../../lib/formContext';

/**
 * RJSF Select widget. Sources options from one of two places:
 *   1. `ui:options.optionSetKey`: look up
 *      `formContext.optionSets[optionSetKey]` (preferred for grouped,
 *      avatar-bearing, or shared lists).
 *   2. Default: `schema.enum` / `oneOf` (the existing RJSF route).
 *
 * Honors `ui:options.footerActionKey` to render a dropdown footer
 * action — resolved from `formContext.actions[footerActionKey]`. The
 * primitive owns visual treatment.
 */
export const SelectWidget = (props: WidgetProps) => {
  const { id, value, required, disabled, readonly, placeholder, rawErrors, options, schema, autofocus, multiple, registry } = props;
  const { onChange, onBlur, onFocus } = useStableRjsfCallbacks<string>(props);

  const optionSetKey = typeof options?.optionSetKey === 'string' ? options.optionSetKey : '';
  const footerActionKey = typeof options?.footerActionKey === 'string' ? options.footerActionKey : '';
  const context = (registry?.formContext ?? {}) as Partial<OmniRjsfFormContext>;

  const selectOptions: SelectOption[] = React.useMemo(() => {
    if (optionSetKey) {
      const set = context.optionSets?.[optionSetKey];
      if (set) return set.map((o) => ({ ...o }));
    }
    const enumOptions = (options?.enumOptions as { value: unknown; label: string }[] | undefined) ?? [];
    return enumOptions.map((opt) => ({ value: String(opt.value), label: opt.label }));
  }, [optionSetKey, context.optionSets, options?.enumOptions]);

  const footerAction: SelectFooterAction | undefined = React.useMemo(() => {
    if (!footerActionKey) return undefined;
    const action = context.actions?.[footerActionKey];
    if (!action) return undefined;
    return {
      label: action.label,
      href: action.href ?? null,
      onSelect: () => {
        if (action.href && typeof window !== 'undefined') {
          // Story / dev: navigation is the caller's concern; widgets must
          // not auto-navigate during render. We expose the href on the
          // primitive's footer button via onSelect so consumers can route.
          window.location.assign(action.href);
        }
      },
    };
  }, [footerActionKey, context.actions]);

  const ph =
    typeof options?.placeholder === 'string'
      ? options.placeholder
      : ((placeholder as string | undefined) ?? (schema.title ? `Select ${String(schema.title).toLowerCase()}…` : 'Select…'));

  if (multiple) {
    return <MultiSelectWidget {...props} />;
  }

  return (
    <SelectPrimitive
      id={id}
      options={selectOptions}
      placeholder={ph}
      searchable={Boolean(options?.searchable)}
      footerAction={footerAction}
      required={required}
      disabled={disabled || readonly}
      invalid={Boolean(rawErrors?.length)}
      value={(value as string | undefined) ?? ''}
      autoFocus={autofocus}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
    />
  );
};
