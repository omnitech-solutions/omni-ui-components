import * as React from 'react';

import { InputPrimitive } from '../Input/InputPrimitive';
import type { InputPrimitiveProps } from '../Input/Input.types';

export type EmailInputPrimitiveProps = Omit<InputPrimitiveProps, 'type' | 'inputMode'>;

// Bare email input primitive. Type/inputMode/autocomplete preset; no chrome.
const EmailInputPrimitiveInner = React.forwardRef<HTMLInputElement, EmailInputPrimitiveProps>(
  ({ placeholder = 'you@example.com', autoComplete = 'email', ...rest }, ref) => (
    <InputPrimitive ref={ref} type="email" inputMode="email" placeholder={placeholder} autoComplete={autoComplete} {...rest} />
  ),
);
EmailInputPrimitiveInner.displayName = 'EmailInputPrimitive';

export const EmailInputPrimitive = React.memo(EmailInputPrimitiveInner) as typeof EmailInputPrimitiveInner;
