import * as React from 'react';

import { InputPrimitive } from '../Input/InputPrimitive';
import type { InputPrimitiveProps } from '../Input/Input.types';
import { formatPhone } from './formatPhone';

export interface PhoneInputPrimitiveProps extends Omit<InputPrimitiveProps, 'type' | 'inputMode' | 'value' | 'onChange'> {
  value?: string;
  onChange?: (next: string) => void;
  /** Default dial code (e.g. `+1`) — switches to international format. */
  defaultDialCode?: string;
}

// Bare phone input primitive. Formatting is part of the control, not chrome.
const PhoneInputPrimitiveInner = React.forwardRef<HTMLInputElement, PhoneInputPrimitiveProps>(
  ({ value = '', onChange, defaultDialCode, placeholder, ...rest }, ref) => {
    const handleChange = React.useCallback(
      (next: string) => {
        onChange?.(formatPhone(next, defaultDialCode));
      },
      [onChange, defaultDialCode],
    );
    return (
      <InputPrimitive
        ref={ref}
        type="tel"
        inputMode="tel"
        placeholder={placeholder ?? (defaultDialCode ? `${defaultDialCode} 555 555 0100` : '(555) 555-0100')}
        value={value}
        onChange={handleChange}
        {...rest}
      />
    );
  },
);
PhoneInputPrimitiveInner.displayName = 'PhoneInputPrimitive';

export const PhoneInputPrimitive = React.memo(PhoneInputPrimitiveInner) as typeof PhoneInputPrimitiveInner;
