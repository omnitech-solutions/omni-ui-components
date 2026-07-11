import * as React from 'react';

export interface DividerProps extends React.ComponentPropsWithoutRef<'div'> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}
