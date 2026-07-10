import * as React from 'react';

import { cn } from 'lib/utils';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import { InputPrimitive } from './InputPrimitive';
import type { InputProps } from './Input.types';

/**
 * Chrome-wrapped Omni Input. Composes {@link InputPrimitive} with a
 * label / description / error stack via {@link FieldShell}.
 *
 * @example
 * <Input label="Project Title" value={title} onChange={setTitle} required />
 */
const InputInner = React.forwardRef<HTMLInputElement, InputProps>(
  ({ id: idProp, wrapperClassName, labelClassName, layout = 'vertical', label, description, error, required, invalid, className, ...primitiveProps }, ref) => {
    const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
      id: idProp,
      label,
      description,
      error,
      invalid,
      prefix: 'oui-input',
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
        wrapperClassName={wrapperClassName}
        labelClassName={labelClassName}
      >
        <InputPrimitive
          ref={ref}
          id={id}
          invalid={isInvalid}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          aria-invalid={isInvalid || undefined}
          className={cn(layout === 'horizontal' && 'flex-1', className)}
          {...primitiveProps}
        />
      </FieldShell>
    );
  },
);
InputInner.displayName = 'Input';

export const Input = React.memo(InputInner) as typeof InputInner;
