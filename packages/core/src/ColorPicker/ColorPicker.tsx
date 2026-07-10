import * as React from 'react';

import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import { ColorPickerPrimitive } from './ColorPickerPrimitive';
import type { FieldLayoutProps } from '../Input/Input.variants';
import type { RootProps } from '../lib';

export interface ColorPickerProps extends RootProps, FieldLayoutProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
  /** Preset swatches. Defaults to a 11-color Omni palette. */
  presets?: string[];
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
  className?: string;
  'data-testid'?: string;
}

/** Chrome-wrapped Omni ColorPicker. */
export const ColorPicker = React.memo(
  React.forwardRef<HTMLButtonElement, ColorPickerProps>(
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
        prefix: 'oui-color',
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
          <ColorPickerPrimitive
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
) as React.NamedExoticComponent<ColorPickerProps>;
(ColorPicker as unknown as { displayName: string }).displayName = 'ColorPicker';
