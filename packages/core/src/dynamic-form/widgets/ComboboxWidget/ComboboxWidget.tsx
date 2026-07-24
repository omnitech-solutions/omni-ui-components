import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';

import { SelectPrimitive, type SelectFooterAction, type SelectOption } from '@oc-tech/omni-ui-components';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import type { OmniRjsfFormContext } from '../../lib/formContext';

/**
 * RJSF Combobox widget — searchable select. Same option-source contract
 * as {@link SelectWidget}: `ui:options.optionSetKey` resolves from
 * `formContext.optionSets`, otherwise falls back to `schema.enum`.
 * `ui:options.footerActionKey` resolves from `formContext.actions`.
 */
export const ComboboxWidget = (props: WidgetProps) => {
  const { id, value, required, disabled, readonly, placeholder, rawErrors, options, schema, registry } = props;
  const { onChange } = useStableRjsfCallbacks<string>(props);

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
        if (action.href && typeof window !== 'undefined') window.location.assign(action.href);
      },
    };
  }, [footerActionKey, context.actions]);

  const ph =
    typeof options?.placeholder === 'string'
      ? options.placeholder
      : ((placeholder as string | undefined) ?? (schema.title ? `Find ${String(schema.title).toLowerCase()}…` : 'Search…'));

  return (
    <SelectPrimitive
      id={id}
      options={selectOptions}
      placeholder={ph}
      searchable
      footerAction={footerAction}
      required={required}
      disabled={disabled || readonly}
      invalid={Boolean(rawErrors?.length)}
      value={(value as string | undefined) ?? ''}
      onChange={onChange}
    />
  );
};
