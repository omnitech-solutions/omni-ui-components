import * as React from 'react';

import { cn } from 'lib/utils';
import { fieldGroupVariants, fieldLabelVariants } from '../Input/Input.variants';
import { useStableId } from './use-stable-id';
import type { FieldLayoutProps } from '../Input/Input.variants';

export interface FieldChromeArgs {
  id?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  invalid?: boolean;
  required?: boolean;
  prefix: string;
}

export interface FieldChrome {
  id: string;
  isInvalid: boolean;
  descriptionId?: string;
  errorId?: string;
  describedBy?: string;
}

// Derives the id, invalid flag, and aria-describedby ids used by every
// chrome-wrapped Omni field. Stable per call.
export function useFieldChrome({ id, label: _label, description, error, invalid, prefix }: FieldChromeArgs): FieldChrome {
  const fallbackId = useStableId(prefix);
  const resolvedId = id ?? fallbackId;
  const isInvalid = Boolean(error) || Boolean(invalid);
  const descriptionId = description ? `${resolvedId}-description` : undefined;
  const errorId = error ? `${resolvedId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;
  return { id: resolvedId, isInvalid, descriptionId, errorId, describedBy };
}

export interface FieldShellProps extends FieldLayoutProps {
  id: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  descriptionId?: string;
  errorId?: string;
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
  const labelNode = label ? (
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
  const helpers =
    description && !error ? (
      <p id={descriptionId} className="font-[family-name:var(--oui-font-sans)] text-xs text-[var(--oui-foreground-muted)]">
        {description}
      </p>
    ) : null;
  const errorNode = error ? (
    <p id={errorId} role="alert" className="font-[family-name:var(--oui-font-sans)] text-xs text-[var(--oui-border-invalid)]">
      {error}
    </p>
  ) : null;

  if (layout === 'horizontal') {
    return (
      <div className={cn(fieldGroupVariants({ layout }), wrapperClassName)} data-layout="horizontal" role={role} aria-labelledby={ariaLabelledBy}>
        {labelNode}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {children}
          {helpers}
          {errorNode}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(fieldGroupVariants({ layout }), wrapperClassName)} data-layout="vertical" role={role} aria-labelledby={ariaLabelledBy}>
      {labelNode}
      {children}
      {helpers}
      {errorNode}
    </div>
  );
};
