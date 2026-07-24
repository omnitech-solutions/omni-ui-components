import * as React from 'react';
import type { WrapIfAdditionalTemplateProps } from '@rjsf/utils';
import { ADDITIONAL_PROPERTY_FLAG, buttonId, TranslatableString } from '@rjsf/utils';

import { cn } from 'lib/utils';
import { inputVariants } from '@oc-tech/omni-ui-components/Input/Input.variants';

/**
 * Omni override of `@rjsf/shadcn`'s WrapIfAdditional template. RJSF
 * uses this to wrap properties of an `additionalProperties` object so
 * each row gets a rename-key input + the value field + a remove button +
 * a separator.
 *
 * Differences from the upstream shadcn theme:
 * - Key input is a native `<input>` styled via `inputVariants` so RJSF's
 *   `defaultValue` + `onBlur` rename pipeline works (Omni `Input` is
 *   controlled and would drop `defaultValue`).
 * - Each row is `col-span-12 w-full` so it stacks vertically inside the
 *   parent `ui:rows` grid instead of flowing horizontally.
 * - Remove button comes from the registered
 *   `ButtonTemplates.RemoveButton` (Omni destructive `IconButton`).
 * - Separator is a plain `<hr>` using Omni border tokens.
 */
export const WrapIfAdditionalTemplate = (props: WrapIfAdditionalTemplateProps) => {
  const {
    classNames,
    style,
    children,
    disabled,
    id,
    label,
    displayLabel,
    onRemoveProperty,
    onKeyRenameBlur,
    rawDescription,
    readonly,
    required,
    schema,
    uiSchema,
    registry,
  } = props;

  const { templates, translateString } = registry;
  const RemoveButton = templates.ButtonTemplates.RemoveButton;
  const keyLabel = translateString(TranslatableString.KeyLabel, [label]);
  const additional = ADDITIONAL_PROPERTY_FLAG in (schema as Record<string, unknown>);

  if (!additional) {
    return (
      <div className={classNames} style={style}>
        {children}
      </div>
    );
  }

  const keyId = `${id}-key`;

  return (
    <div data-slot="wrap-if-additional" className="col-span-12 w-full">
      <div className={`flex w-full items-end gap-3 ${classNames ?? ''}`} style={style}>
        <div className="flex w-2/5 flex-col gap-1">
          {displayLabel ? (
            <label htmlFor={keyId} className="text-xs font-medium text-[var(--oui-foreground)]">
              {keyLabel}
            </label>
          ) : null}
          <input
            key={label}
            id={keyId}
            name={keyId}
            type="text"
            required={required}
            defaultValue={label}
            disabled={disabled || readonly}
            onBlur={!readonly ? (onKeyRenameBlur as React.FocusEventHandler<HTMLInputElement>) : undefined}
            className={cn(inputVariants({ variant: 'bordered', inputSize: 'default' }), 'px-3')}
          />
          {rawDescription ? <span className="text-xs font-medium text-[var(--oui-foreground-muted)]">{rawDescription}</span> : null}
        </div>
        <div className="min-w-0 flex-1">{children}</div>
        <div className="flex shrink-0 items-end pb-1">
          <RemoveButton
            id={buttonId(id, 'remove')}
            iconType="block"
            className="rjsf-object-property-remove"
            disabled={disabled || readonly}
            onClick={onRemoveProperty}
            uiSchema={uiSchema}
            registry={registry}
          />
        </div>
      </div>
      <hr className="my-3 border-0 border-t border-[var(--oui-border-field)]" />
    </div>
  );
};
