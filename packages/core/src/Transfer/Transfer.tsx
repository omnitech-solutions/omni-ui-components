import { cn } from 'lib/utils';
import * as React from 'react';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import type { TransferItem, TransferProps } from './Transfer.types';
import { TransferPrimitive } from './TransferPrimitive';

function TransferInner<T extends TransferItem>(
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
  }: TransferProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
    id: idProp,
    label,
    description,
    error,
    invalid,
    prefix: 'oui-transfer',
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
      <TransferPrimitive<T>
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
}

/**
 * Chrome-wrapped Omni Transfer. Composes {@link TransferPrimitive} with {@link FieldShell}: the label names the
 * pair of lists, the description and the error describe the source list (the one focus lands on).
 *
 * @example
 * <Transfer label="Teams with access" dataSource={teams} targetKeys={keys} onChange={(next) => setKeys(next)} />
 */
export const Transfer = React.forwardRef(TransferInner) as (<T extends TransferItem = TransferItem>(
  props: TransferProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null) & { displayName?: string };
Transfer.displayName = 'Transfer';
