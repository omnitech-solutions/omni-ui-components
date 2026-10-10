import * as React from 'react';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import type { TreeSelectNode, TreeSelectPrimitiveProps, TreeSelectProps } from './TreeSelect.types';
import { TreeSelectPrimitive } from './TreeSelectPrimitive';

function TreeSelectRender<T extends TreeSelectNode = TreeSelectNode>(
  props: TreeSelectProps<T>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const {
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
  } = props;
  const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
    id: idProp,
    label,
    description,
    error,
    invalid,
    prefix: 'oui-tree-select',
  });
  // The popover tree is named by the same label as the trigger.
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
      labelId={labelId}
      wrapperClassName={wrapperClassName}
      labelClassName={labelClassName}
    >
      <TreeSelectPrimitive<T>
        {...(primitiveProps as TreeSelectPrimitiveProps<T>)}
        ref={ref}
        id={id}
        invalid={isInvalid}
        required={required}
        aria-describedby={[ariaDescribedBy, describedBy].filter(Boolean).join(' ') || undefined}
        aria-labelledby={ariaLabelledBy ?? labelId}
      />
    </FieldShell>
  );
}

/**
 * Tree select inside the field chrome: {@link TreeSelectPrimitive} with a label, description and error.
 */
export const TreeSelect = React.forwardRef(TreeSelectRender) as (<
  T extends TreeSelectNode = TreeSelectNode,
>(
  props: TreeSelectProps<T> & React.RefAttributes<HTMLButtonElement>,
) => React.ReactElement | null) & { displayName?: string };
TreeSelect.displayName = 'TreeSelect';
