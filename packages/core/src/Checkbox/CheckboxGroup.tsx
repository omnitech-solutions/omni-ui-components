import * as React from 'react';

import { cn } from 'lib/utils';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import { CheckboxGroupPrimitive } from './CheckboxGroupPrimitive';
import type { CheckboxGroupProps } from './Checkbox.types';

/**
 * Chrome-wrapped Omni checkbox group. Composes
 * {@link CheckboxGroupPrimitive} with {@link FieldShell}.
 */
const CheckboxGroupInner = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  ({ id: idProp, wrapperClassName, labelClassName, layout = 'vertical', label, description, error, required, invalid, className, ...primitiveProps }, ref) => {
    const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
      id: idProp,
      label,
      description,
      error,
      invalid,
      prefix: 'oui-checkbox-group',
    });
    const labelId = label ? `${id}-label` : undefined;
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
        labelId={labelId}
        role="group"
        ariaLabelledBy={labelId}
        wrapperClassName={wrapperClassName}
        labelClassName={labelClassName}
      >
        <CheckboxGroupPrimitive
          ref={ref}
          id={id}
          invalid={isInvalid}
          required={required}
          aria-describedby={describedBy}
          className={cn(layout === 'horizontal' && 'flex-1', className)}
          {...primitiveProps}
        />
      </FieldShell>
    );
  },
);
CheckboxGroupInner.displayName = 'CheckboxGroup';

export const CheckboxGroup = React.memo(CheckboxGroupInner) as typeof CheckboxGroupInner;
