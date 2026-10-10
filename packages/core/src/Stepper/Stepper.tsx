import { cn } from 'lib/utils';
import * as React from 'react';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import type { StepperProps } from './Stepper.types';
import { StepperPrimitive } from './StepperPrimitive';

/**
 * Chrome-wrapped Omni Stepper. Composes {@link StepperPrimitive} with a
 * label / description / error stack via {@link FieldShell}.
 */
const StepperInner = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      id: idProp,
      wrapperClassName,
      labelClassName,
      layout = 'vertical',
      label,
      description,
      error,
      required,
      invalid,
      className,
      ...primitiveProps
    },
    ref,
  ) => {
    const { id, isInvalid, descriptionId, errorId, requiredId, describedBy } = useFieldChrome({
      id: idProp,
      required,
      // The control cannot carry `aria-required`: it is described by a hidden "Required" hint instead.
      requiredHint: true,
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
        requiredId={requiredId}
        labelTag="span"
        labelId={labelId}
        role="group"
        ariaLabelledBy={labelId}
        wrapperClassName={cn(wrapperClassName, layout === 'vertical' && 'gap-2')}
        labelClassName={cn(
          'text-xs font-semibold uppercase tracking-wide text-[var(--oui-foreground-muted)]',
          labelClassName,
        )}
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
