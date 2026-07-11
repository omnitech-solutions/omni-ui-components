import * as React from 'react';

import { Button } from '../Button';

export interface FloatButtonProps extends React.ComponentProps<typeof Button> {
  bottom?: number;
  right?: number;
}

export const FloatButton = React.forwardRef<HTMLButtonElement, FloatButtonProps>(({ bottom = 24, right = 24, style, ...props }, ref) => (
  <Button ref={ref} style={{ position: 'fixed', bottom, right, borderRadius: 9999, ...style }} {...props} />
));
FloatButton.displayName = 'FloatButton';
