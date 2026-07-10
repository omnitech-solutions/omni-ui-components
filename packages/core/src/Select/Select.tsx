import * as React from 'react';

import { cn } from 'lib/utils';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import { SelectPrimitive } from './SelectPrimitive';
import type { SelectProps } from './Select.types';

/**
 * Chrome-wrapped Omni Select. Composes {@link SelectPrimitive} with
 * label / description / error rows via {@link FieldShell}.
 */
const SelectInner = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ id: idProp, wrapperClassName, labelClassName, layout = 'vertical', label, description, error, required, invalid, className, ...primitiveProps }, ref) => {
    const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
      id: idProp,
      label,
      description,
      error,
      invalid,
      prefix: 'oui-select',
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
        <SelectPrimitive
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
SelectInner.displayName = 'Select';

export const Select = React.memo(SelectInner) as typeof SelectInner;
