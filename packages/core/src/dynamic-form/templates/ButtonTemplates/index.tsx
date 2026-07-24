import * as React from 'react';
import type { IconButtonProps, SubmitButtonProps } from '@rjsf/utils';
import { TranslatableString, getSubmitButtonOptions } from '@rjsf/utils';
import { ChevronDown, ChevronUp, Copy, Trash2, X } from 'lucide-react';

import { cn } from 'lib/utils';

import { Button, IconButton } from '@oc-tech/omni-ui-components';

/**
 * RJSF IconButton bridge — RJSF's array / object toolbars look up named
 * button templates (`CopyButton`, `MoveDownButton`, `MoveUpButton`,
 * `RemoveButton`) and pass an `IconButtonProps` shape we forward to the
 * Omni `IconButton`.
 *
 * Mirrors `@rjsf/shadcn`'s `IconButton` set:
 * https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/shadcn/src/IconButton/IconButton.tsx
 *
 * The five RJSF concerns:
 * - `CopyButton`     — duplicate an array item.
 * - `MoveDownButton` — reorder one slot lower.
 * - `MoveUpButton`   — reorder one slot higher.
 * - `RemoveButton`   — delete an array item (destructive variant).
 * - `ClearButton`    — clear a multi-schema selection (X icon).
 */

const stripRjsfProps = ({ uiSchema: _uiSchema, registry: _registry, iconType: _iconType, ...rest }: IconButtonProps) => rest;

const useTranslate = (props: IconButtonProps) => props.registry?.translateString;

/**
 * Generic RJSF IconButton template. Omni's `IconButton` provides the
 * chrome; RJSF supplies the icon node + handlers.
 */
export const RjsfIconButton = (props: IconButtonProps & { icon?: React.ReactNode }) => {
  const { icon, ...rest } = stripRjsfProps(props);
  return <IconButton {...(rest as React.ComponentProps<typeof IconButton>)} icon={icon} variant="outline" />;
};

export const CopyButton = (props: IconButtonProps) => {
  const translate = useTranslate(props);
  return (
    <RjsfIconButton {...props} title={translate?.(TranslatableString.CopyButton)} aria-label={translate?.(TranslatableString.CopyButton)} icon={<Copy />} />
  );
};

export const MoveDownButton = (props: IconButtonProps) => {
  const translate = useTranslate(props);
  return (
    <RjsfIconButton
      {...props}
      title={translate?.(TranslatableString.MoveDownButton)}
      aria-label={translate?.(TranslatableString.MoveDownButton)}
      icon={<ChevronDown />}
    />
  );
};

export const MoveUpButton = (props: IconButtonProps) => {
  const translate = useTranslate(props);
  return (
    <RjsfIconButton
      {...props}
      title={translate?.(TranslatableString.MoveUpButton)}
      aria-label={translate?.(TranslatableString.MoveUpButton)}
      icon={<ChevronUp />}
    />
  );
};

export const RemoveButton = (props: IconButtonProps) => {
  const translate = useTranslate(props);
  const { uiSchema: _uiSchema, registry: _registry, iconType: _iconType, ...rest } = props;
  return (
    <IconButton
      {...(rest as React.ComponentProps<typeof IconButton>)}
      title={translate?.(TranslatableString.RemoveButton)}
      aria-label={translate?.(TranslatableString.RemoveButton)}
      variant="destructive"
      icon={<Trash2 />}
    />
  );
};

export const ClearButton = (props: IconButtonProps) => {
  const translate = useTranslate(props);
  return (
    <RjsfIconButton {...props} title={translate?.(TranslatableString.ClearButton)} aria-label={translate?.(TranslatableString.ClearButton)} icon={<X />} />
  );
};

/**
 * RJSF SubmitButton template. Routes through the shadcn `Button` primitive
 * and honours `ui:submitButtonOptions` (submitText, norender, className,
 * etc.) via {@link getSubmitButtonOptions}.
 *
 * Note: Omni's `DynamicForm` forces `ui:submitButtonOptions.norender =
 * true` by default because the outer `Form` provides its own submit
 * affordance. This template is here for theme parity and for callers who
 * use raw RJSF `Form` or opt back into RJSF's submit (e.g.,
 * `ui:submitButtonOptions: { norender: false }`).
 */
export const SubmitButton = (props: SubmitButtonProps) => {
  const { submitText, norender, props: submitButtonProps } = getSubmitButtonOptions(props.uiSchema);
  if (norender) return null;
  const { className, ...rest } = submitButtonProps ?? {};
  return (
    <div data-slot="rjsf-submit-button">
      <Button type="submit" {...rest} className={cn('my-2', className as string | undefined)}>
        {submitText}
      </Button>
    </div>
  );
};
