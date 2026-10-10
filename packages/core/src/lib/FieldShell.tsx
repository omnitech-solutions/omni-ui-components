import { cn } from 'lib/utils';
import type * as React from 'react';
import type { FieldLayoutProps } from '../Input/Input.variants';
import { fieldGroupVariants, fieldLabelVariants } from '../Input/Input.variants';
import { useStableId } from './use-stable-id';

export interface FieldChromeArgs {
  id?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  invalid?: boolean;
  required?: boolean;
  /**
   * For a control whose role cannot carry `aria-required` (a button that opens a list or a dialog, a slider, a
   * group): when it is required, the shell draws a "Required" hint for assistive technology and the control is
   * described by it.
   */
  requiredHint?: boolean;
  prefix: string;
}

export interface FieldChrome {
  id: string;
  isInvalid: boolean;
  descriptionId?: string;
  errorId?: string;
  /** Id of the hidden "Required" hint; pass it to {@link FieldShell}. Set only with `requiredHint` on a required field. */
  requiredId?: string;
  describedBy?: string;
}

// Derives the id, invalid flag, and aria-describedby ids used by every
// chrome-wrapped Omni field. Stable per call.
export function useFieldChrome({
  id,
  label: _label,
  description,
  error,
  invalid,
  required,
  requiredHint,
  prefix,
}: FieldChromeArgs): FieldChrome {
  const fallbackId = useStableId(prefix);
  const resolvedId = id ?? fallbackId;
  const isInvalid = Boolean(error) || Boolean(invalid);
  const descriptionId = description ? `${resolvedId}-description` : undefined;
  const errorId = error ? `${resolvedId}-error` : undefined;
  const requiredId = requiredHint && required ? `${resolvedId}-required` : undefined;
  const describedBy = [requiredId, descriptionId, errorId].filter(Boolean).join(' ') || undefined;
  return { id: resolvedId, isInvalid, descriptionId, errorId, requiredId, describedBy };
}

export interface FieldShellProps extends FieldLayoutProps {
  id: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  descriptionId?: string;
  errorId?: string;
  /** From {@link useFieldChrome} with `requiredHint`: draws the hidden "Required" hint the control is described by. */
  requiredId?: string;
  /** A line under the control that stays visible beside the description and the error (a schema form's `ui:help`). */
  help?: React.ReactNode;
  helpId?: string;
  /** A node at the end of the label row (a link or a button the host supplies). */
  labelAction?: React.ReactNode;
  /** The words of the hidden "Required" hint. Default `Required`. */
  requiredLabel?: string;
  labelTag?: 'label' | 'span';
  labelId?: string;
  role?: string;
  ariaLabelledBy?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  children: React.ReactNode;
}

// Renders the shared field chrome: outer wrapper, label (with required
// asterisk), control, description, and error. Horizontal layout wraps the
// control + helpers in an inner flex column so the label sits inline.
export const FieldShell: React.FC<FieldShellProps> = ({
  id,
  layout = 'vertical',
  label,
  description,
  error,
  required,
  descriptionId,
  errorId,
  requiredId,
  help,
  helpId,
  labelAction,
  requiredLabel = 'Required',
  labelTag = 'label',
  labelId,
  role,
  ariaLabelledBy,
  wrapperClassName,
  labelClassName,
  children,
}) => {
  const labelClasses = cn(fieldLabelVariants({ layout }), labelClassName);
  const requiredMark = required ? (
    <span className="ml-0.5 text-[var(--oui-foreground-required)]" aria-hidden="true">
      *
    </span>
  ) : null;
  const labelElement = label ? (
    labelTag === 'label' ? (
      <label htmlFor={id} className={labelClasses} id={labelId}>
        {label}
        {requiredMark}
      </label>
    ) : (
      <span className={labelClasses} id={labelId}>
        {label}
        {requiredMark}
      </span>
    )
  ) : null;
  const labelNode =
    labelElement && labelAction ? (
      <div className="flex items-baseline justify-between gap-3" data-slot="field-label-row">
        {labelElement}
        {labelAction}
      </div>
    ) : (
      labelElement
    );
  // The asterisk is hidden from assistive technology; a control that cannot carry `aria-required` is described by this.
  const requiredHint = requiredId ? (
    <span id={requiredId} className="sr-only">
      {requiredLabel}
    </span>
  ) : null;
  const helpers =
    description && !error ? (
      <p
        id={descriptionId}
        className="font-[family-name:var(--oui-font-sans)] text-xs text-[var(--oui-foreground-muted)]"
      >
        {description}
      </p>
    ) : null;
  const errorNode = error ? (
    <p
      id={errorId}
      role="alert"
      className="font-[family-name:var(--oui-font-sans)] text-xs text-[var(--oui-border-invalid)]"
    >
      {error}
    </p>
  ) : null;
  const helpNode = help ? (
    <p
      id={helpId}
      className="font-[family-name:var(--oui-font-sans)] text-xs text-[var(--oui-foreground-muted)]"
    >
      {help}
    </p>
  ) : null;

  if (layout === 'horizontal') {
    return (
      <div
        className={cn(fieldGroupVariants({ layout }), wrapperClassName)}
        data-layout="horizontal"
        role={role}
        aria-labelledby={ariaLabelledBy}
      >
        {labelNode}
        {requiredHint}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {children}
          {helpers}
          {errorNode}
          {helpNode}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(fieldGroupVariants({ layout }), wrapperClassName)}
      data-layout="vertical"
      role={role}
      aria-labelledby={ariaLabelledBy}
    >
      {labelNode}
      {requiredHint}
      {children}
      {helpers}
      {errorNode}
      {helpNode}
    </div>
  );
};
