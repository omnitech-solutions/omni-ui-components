import * as React from 'react';

import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import { InputOTPPrimitive } from './InputOTPPrimitive';
import type { FieldLayoutProps } from '../Input/Input.variants';
import type { RootProps } from '../lib';

export interface InputOTPProps extends RootProps, FieldLayoutProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
  /** Number of slots. Default 6. */
  length?: number;
  /** Insert a separator dot after this slot index (0-based). */
  separatorIndex?: number;
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

/**
 * Omni InputOTP — chrome-wrapped {@link InputOTPPrimitive}.
 */
export const InputOTP = React.memo(
  React.forwardRef<HTMLInputElement, InputOTPProps>(
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
        prefix: 'oui-otp',
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
          <InputOTPPrimitive
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
) as React.NamedExoticComponent<InputOTPProps>;
(InputOTP as unknown as { displayName: string }).displayName = 'InputOTP';
