import * as React from 'react';

import { cn } from 'lib/utils';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import { NumberInputPrimitive } from './NumberInputPrimitive';
import type { NumberInputProps } from './NumberInput.types';

/** Chrome-wrapped Omni NumberInput. */
const NumberInputInner = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ id: idProp, wrapperClassName, labelClassName, layout = 'vertical', label, description, error, required, invalid, className, ...primitiveProps }, ref) => {
    const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
      id: idProp,
      label,
      description,
      error,
      invalid,
      prefix: 'oui-number',
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
        <NumberInputPrimitive
          ref={ref}
          id={id}
          invalid={isInvalid}
          required={required}
          aria-describedby={describedBy}
          className={cn(className)}
          {...primitiveProps}
        />
      </FieldShell>
    );
  },
);
NumberInputInner.displayName = 'NumberInput';

export const NumberInput = React.memo(NumberInputInner) as typeof NumberInputInner;
