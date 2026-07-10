import * as React from 'react';

import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import { RichTextPrimitive } from './RichTextPrimitive';
import type { FieldLayoutProps } from '../Input/Input.variants';
import type { RootProps } from '../lib';

export interface RichTextProps extends RootProps, FieldLayoutProps {
  id?: string;
  name?: string;
  /** HTML string value. */
  value?: string;
  onChange?: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
  className?: string;
  'data-testid'?: string;
}

/** Chrome-wrapped Omni RichText. */
export const RichText = React.memo(
  React.forwardRef<HTMLDivElement, RichTextProps>(
    (
      { id: idProp, wrapperClassName, labelClassName, layout = 'vertical', label, description, error, required, invalid, className, ...primitiveProps },
      ref,
    ) => {
      const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
        id: idProp,
        label,
        description,
        error,
        invalid,
        prefix: 'oui-rich-text',
      });
      return (
        <FieldShell
          id={id}
          layout={layout}
          label={label}
          description={description}
          error={error}
          required={required}
          descriptionId={descriptionId}
          errorId={errorId}
          labelTag="span"
          wrapperClassName={wrapperClassName}
          labelClassName={labelClassName}
        >
          <RichTextPrimitive
            ref={ref}
            id={id}
            invalid={isInvalid}
            required={required}
            aria-describedby={describedBy}
            className={className}
            {...primitiveProps}
          />
        </FieldShell>
      );
    },
  ),
) as React.NamedExoticComponent<RichTextProps>;
(RichText as unknown as { displayName: string }).displayName = 'RichText';
