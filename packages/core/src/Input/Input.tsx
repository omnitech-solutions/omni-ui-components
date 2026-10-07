import { cn } from 'lib/utils';
import * as React from 'react';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import type { InputProps } from './Input.types';
import { InputPrimitive } from './InputPrimitive';

/**
 * Chrome-wrapped Omni Input. Composes {@link InputPrimitive} with a
 * label / description / error stack via {@link FieldShell}.
 *
 * `actions` adds a trailing slot (a composer's mic and send); `variant="panel"` is the see-through dock field.
 *
 * @example
 * <Input label="Project Title" value={title} onChange={setTitle} required />
 * <Input variant="panel" aria-label="Message" value={text} onChange={setText} actions={<IconButton label="Send" icon={<ArrowUp />} />} />
 */
const InputInner = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id: idProp,
      wrapperClassName,
      labelClassName,
      layout = 'vertical',
      actions,
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
    const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
      id: idProp,
      label,
      description,
      error,
      invalid,
      prefix: 'oui-input',
    });
    const hasActions = actions !== undefined && actions !== null && actions !== false;
    const field = (
      <InputPrimitive
        ref={ref}
        id={id}
        invalid={isInvalid}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        aria-invalid={isInvalid || undefined}
        className={cn((layout === 'horizontal' || hasActions) && 'flex-1', className)}
        {...primitiveProps}
      />
    );
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
        {hasActions ? (
          <div data-slot="input-row" className="flex w-full min-w-0 items-center gap-1.5">
            {field}
            <div data-slot="input-actions" className="flex flex-none items-center gap-1.5">
              {actions}
            </div>
          </div>
        ) : (
          field
        )}
      </FieldShell>
    );
  },
);
InputInner.displayName = 'Input';

export const Input = React.memo(InputInner) as typeof InputInner;
