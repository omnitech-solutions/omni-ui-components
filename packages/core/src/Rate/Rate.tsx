import { cn } from 'lib/utils';
import * as React from 'react';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import type { RateProps } from './Rate.types';
import { RatePrimitive } from './RatePrimitive';

/**
 * Chrome-wrapped Omni Rate. Composes {@link RatePrimitive} with {@link FieldShell}: the label names the radio
 * group, the description and the error describe it.
 *
 * @example
 * <Rate label="Answer quality" description="How well did it land?" value={score} onChange={setScore} />
 */
const RateInner = React.forwardRef<HTMLDivElement, RateProps>(
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
      'aria-describedby': ariaDescribedBy,
      'aria-labelledby': ariaLabelledBy,
      ...primitiveProps
    },
    ref,
  ) => {
    const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
      id: idProp,
      label,
      description,
      error,
      invalid,
      prefix: 'oui-rate',
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
        wrapperClassName={wrapperClassName}
        labelClassName={labelClassName}
      >
        <RatePrimitive
          ref={ref}
          id={id}
          invalid={isInvalid}
          required={required}
          aria-labelledby={cn(labelId, ariaLabelledBy) || undefined}
          aria-describedby={cn(ariaDescribedBy, describedBy) || undefined}
          {...primitiveProps}
        />
      </FieldShell>
    );
  },
);
RateInner.displayName = 'Rate';

export const Rate = React.memo(RateInner) as typeof RateInner;
