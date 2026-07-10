import * as React from 'react';
import type { FieldTemplateProps } from '@rjsf/utils';
import { getTemplate, getUiOptions } from '@rjsf/utils';

import { cn } from 'lib/utils';
import type { OmniRjsfFormContext } from '../lib/formContext';

/**
 * Omni override of the shadcn `FieldTemplate`. Same structure as the
 * upstream template but the required `*` always renders in
 * `text-destructive`, matching the legacy `.form-field` modal asterisk
 * styling.
 */
export const FieldTemplate = (props: FieldTemplateProps) => {
  const {
    id,
    children,
    displayLabel,
    rawErrors = [],
    errors,
    help,
    description,
    rawDescription,
    classNames,
    style,
    disabled,
    label,
    hidden,
    onKeyRename,
    onKeyRenameBlur,
    onRemoveProperty,
    readonly,
    required,
    schema,
    uiSchema,
    registry,
  } = props;
  const uiOptions = getUiOptions(uiSchema);
  const WrapIfAdditionalTemplate = getTemplate('WrapIfAdditionalTemplate', registry, uiOptions);

  /* Optional inline action rendered next to the label (e.g. "View Task"
   * link next to a Task field). Resolved by id from
   * formContext.actions; renders as an anchor when href is set,
   * otherwise as a no-op span. The widget itself owns no business
   * navigation. */
  const labelActionKey = typeof uiOptions.labelActionKey === 'string' ? uiOptions.labelActionKey : '';
  const formContext = (registry?.formContext ?? {}) as Partial<OmniRjsfFormContext>;
  const labelAction = labelActionKey ? formContext.actions?.[labelActionKey] : undefined;

  if (hidden) {
    return <div className="hidden">{children}</div>;
  }
  const isCheckbox = uiOptions.widget === 'checkbox';

  return (
    <WrapIfAdditionalTemplate
      classNames={classNames}
      style={style}
      disabled={disabled}
      id={id}
      label={label}
      displayLabel={displayLabel}
      onKeyRename={onKeyRename}
      onKeyRenameBlur={onKeyRenameBlur}
      onRemoveProperty={onRemoveProperty}
      rawDescription={rawDescription}
      readonly={readonly}
      required={required}
      schema={schema}
      uiSchema={uiSchema}
      registry={registry}
    >
      <div className="flex flex-col gap-2">
        {displayLabel && !isCheckbox && (
          <div className="flex items-baseline justify-between gap-3">
            <label
              htmlFor={id}
              className={cn(
                'text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                rawErrors.length > 0 && 'text-destructive',
              )}
            >
              {label}
              {required ? (
                <span className="ml-0.5 text-[var(--oui-foreground-required)]" aria-hidden="true">
                  *
                </span>
              ) : null}
            </label>
            {labelAction ? (
              labelAction.href ? (
                <a href={labelAction.href} data-testid={`${id}-label-action`} className="text-xs font-medium text-primary hover:underline">
                  {labelAction.label}
                </a>
              ) : (
                <span data-testid={`${id}-label-action`} className="text-xs font-medium text-primary">
                  {labelAction.label}
                </span>
              )
            ) : null}
          </div>
        )}
        {children}
        {displayLabel && rawDescription && !isCheckbox && (
          <span className={cn('text-xs font-medium text-muted-foreground', rawErrors.length > 0 && 'text-destructive')}>{description}</span>
        )}
        {errors}
        {help}
      </div>
    </WrapIfAdditionalTemplate>
  );
};
