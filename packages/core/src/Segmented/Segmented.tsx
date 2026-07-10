import * as React from 'react';

import { cn } from 'lib/utils';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import { SegmentedPrimitive } from './SegmentedPrimitive';
import type { SegmentedProps } from './Segmented.types';

/**
 * Chrome-wrapped Omni Segmented control. Composes
 * {@link SegmentedPrimitive} with {@link FieldShell}.
 */
const SegmentedInner = React.forwardRef<HTMLDivElement, SegmentedProps>(
  ({ id: idProp, wrapperClassName, labelClassName, layout = 'vertical', label, description, error, required, invalid, className, ...primitiveProps }, ref) => {
    const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
      id: idProp,
      label,
      description,
      error,
      invalid,
      prefix: 'oui-segmented',
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
        wrapperClassName={cn(wrapperClassName, layout === 'vertical' && 'gap-2')}
        labelClassName={labelClassName}
      >
        <SegmentedPrimitive
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
SegmentedInner.displayName = 'Segmented';

export const Segmented = React.memo(SegmentedInner) as typeof SegmentedInner;
