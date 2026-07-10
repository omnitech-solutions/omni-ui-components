import * as React from 'react';

import { cn } from 'lib/utils';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import { TextareaPrimitive } from './TextareaPrimitive';
import type { TextareaProps } from './Textarea.types';

/**
 * Chrome-wrapped Omni Textarea. Composes {@link TextareaPrimitive} with
 * label / description / error rows via {@link FieldShell}.
 *
 * @example
 * <Textarea label="Message" value={msg} onChange={setMsg} rows={6} required />
 */
const TextareaInner = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ id: idProp, wrapperClassName, labelClassName, layout = 'vertical', label, description, error, required, invalid, className, ...primitiveProps }, ref) => {
    const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
      id: idProp,
      label,
      description,
      error,
      invalid,
      prefix: 'oui-textarea',
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
        <TextareaPrimitive
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
TextareaInner.displayName = 'Textarea';

export const Textarea = React.memo(TextareaInner) as typeof TextareaInner;
