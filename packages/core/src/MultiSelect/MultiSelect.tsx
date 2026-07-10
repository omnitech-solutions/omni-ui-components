import * as React from 'react';

import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import { MultiSelectPrimitive } from './MultiSelectPrimitive';
import type { SelectOption } from '../Select';
import type { FieldLayoutProps } from '../Input/Input.variants';
import type { RootProps } from '../lib';

export interface MultiSelectProps extends RootProps, FieldLayoutProps {
  id?: string;
  name?: string;
  options: SelectOption[];
  value?: string[];
  onChange?: (next: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  maxItems?: number;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
  className?: string;
  'data-testid'?: string;
}

/** Chrome-wrapped Omni MultiSelect. */
export const MultiSelect = React.memo(
  React.forwardRef<HTMLButtonElement, MultiSelectProps>(
    (
      { id: idProp, wrapperClassName, labelClassName, layout = 'vertical', label, description, error, required, invalid, className, ...primitiveProps },
      ref,
    ) => {
      const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
        id: idProp,
        label,
        description,
        error,
        invalid,
        prefix: 'oui-multi-select',
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
          labelTag="span"
          wrapperClassName={wrapperClassName}
          labelClassName={labelClassName}
        >
          <MultiSelectPrimitive
            ref={ref}
            id={id}
            invalid={isInvalid}
            required={required}
            aria-describedby={describedBy}
            className={className}
            {...primitiveProps}
          />
        </FieldShell>
      );
    },
  ),
) as React.NamedExoticComponent<MultiSelectProps>;
(MultiSelect as unknown as { displayName: string }).displayName = 'MultiSelect';
