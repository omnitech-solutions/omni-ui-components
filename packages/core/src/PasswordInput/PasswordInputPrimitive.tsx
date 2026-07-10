import * as React from 'react';

import { InputPrimitive } from '../Input/InputPrimitive';
import type { InputPrimitiveProps } from '../Input/Input.types';

export type PasswordInputPrimitiveProps = Omit<InputPrimitiveProps, 'type'>;

// Bare password input primitive. No chrome, no eye toggle.
const PasswordInputPrimitiveInner = React.forwardRef<HTMLInputElement, PasswordInputPrimitiveProps>((props, ref) => (
  <InputPrimitive ref={ref} type="password" {...props} />
));
PasswordInputPrimitiveInner.displayName = 'PasswordInputPrimitive';

export const PasswordInputPrimitive = React.memo(PasswordInputPrimitiveInner) as typeof PasswordInputPrimitiveInner;
