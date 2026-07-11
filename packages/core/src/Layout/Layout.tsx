import * as React from 'react';

import { cn } from 'lib/utils';

export interface LayoutSectionProps extends React.HTMLAttributes<HTMLElement> {}

const makeSection = <T extends HTMLElement>(displayName: string, tag: keyof JSX.IntrinsicElements, baseClassName: string) => {
  const Component = React.forwardRef<T, LayoutSectionProps>(({ className, ...props }, ref) =>
    React.createElement(tag, { ref, className: cn(baseClassName, className), ...props }),
  );
  Component.displayName = displayName;
  return React.memo(Component) as typeof Component;
};

export const Layout = makeSection<HTMLElement>('Layout', 'section', 'flex min-h-0 flex-col');
export const Header = makeSection<HTMLElement>('Header', 'header', 'border-b px-6 py-4');
export const Content = makeSection<HTMLElement>('Content', 'main', 'min-h-0 flex-1 px-6 py-4');
export const Footer = makeSection<HTMLElement>('Footer', 'footer', 'border-t px-6 py-4');
export const Sider = makeSection<HTMLElement>('Sider', 'aside', 'min-h-0 border-r px-4 py-4');
