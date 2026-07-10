import * as React from 'react';

import { cn } from 'lib/utils';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import { StepperPrimitive } from './StepperPrimitive';
import type { StepperProps } from './Stepper.types';

/**
 * Chrome-wrapped Omni Stepper. Composes {@link StepperPrimitive} with a
 * label / description / error stack via {@link FieldShell}.
 */
const StepperInner = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ id: idProp, wrapperClassName, labelClassName, layout = 'vertical', label, description, error, required, invalid, className, ...primitiveProps }, ref) => {
    const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
      id: idProp,
      label,
      description,
      error,
      invalid,
      prefix: 'oui-stepper',
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
        labelClassName={cn('text-xs font-semibold uppercase tracking-wide text-[var(--oui-foreground-muted)]', labelClassName)}
      >
        <StepperPrimitive
          ref={ref}
          id={id}
          invalid={isInvalid}
          required={required}
          aria-describedby={describedBy}
          className={cn(layout === 'horizontal' && 'shrink-0', className)}
          {...primitiveProps}
        />
      </FieldShell>
    );
  },
);
StepperInner.displayName = 'Stepper';

export const Stepper = React.memo(StepperInner) as typeof StepperInner;
