import * as React from 'react';

export interface AffixProps extends React.HTMLAttributes<HTMLDivElement> {
  offsetTop?: number;
  offsetBottom?: number;
}

export const Affix = React.forwardRef<HTMLDivElement, AffixProps>(({ offsetTop, offsetBottom, style, ...props }, ref) => (
  <div ref={ref} style={{ position: 'sticky', top: offsetTop, bottom: offsetBottom, ...style }} {...props} />
));
Affix.displayName = 'Affix';
