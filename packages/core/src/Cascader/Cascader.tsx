import { cn } from 'lib/utils';
import * as React from 'react';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import type { CascaderOption, CascaderProps } from './Cascader.types';
import { CascaderPrimitive } from './CascaderPrimitive';

function CascaderInner<T extends CascaderOption = CascaderOption>(
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
    'aria-describedby': ariaDescribedBy,
    ...primitiveProps
  }: CascaderProps<T>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
    id: idProp,
    label,
    description,
    error,
    invalid,
    prefix: 'oui-cascader',
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
      <CascaderPrimitive<T>
        ref={ref}
        id={id}
        invalid={isInvalid}
        required={required}
        aria-describedby={[ariaDescribedBy, describedBy].filter(Boolean).join(' ') || undefined}
        className={cn(layout === 'horizontal' && 'flex-1', className)}
        {...primitiveProps}
      />
    </FieldShell>
  );
}

/**
 * Chooses a path through a tree of options, one column per level. Composes
 * {@link CascaderPrimitive} with the label, description and error rows.
 *
 * @example
 * <Cascader label="Stack" options={stack} value={path} onChange={(next) => setPath(next)} />
 */
export const Cascader = React.forwardRef(CascaderInner) as (<
  T extends CascaderOption = CascaderOption,
>(
  props: CascaderProps<T> & React.RefAttributes<HTMLButtonElement>,
) => React.ReactElement | null) & { displayName?: string };
Cascader.displayName = 'Cascader';
