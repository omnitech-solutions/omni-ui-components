import * as React from 'react';

import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import { FileUploadPrimitive } from './FileUploadPrimitive';
import type { FieldLayoutProps } from '../Input/Input.variants';
import type { RootProps } from '../lib';

export interface FileUploadProps extends RootProps, FieldLayoutProps {
  id?: string;
  name?: string;
  value?: File[] | null;
  onChange?: (next: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  onError?: (message: string) => void;
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

/** Chrome-wrapped Omni FileUpload. */
export const FileUpload = React.memo(
  React.forwardRef<HTMLInputElement, FileUploadProps>(
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
        prefix: 'oui-file-upload',
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
          <FileUploadPrimitive
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
) as React.NamedExoticComponent<FileUploadProps>;
(FileUpload as unknown as { displayName: string }).displayName = 'FileUpload';
