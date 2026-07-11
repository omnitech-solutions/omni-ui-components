import * as React from 'react';

import { cn } from 'lib/utils';

type BaseProps<T extends keyof JSX.IntrinsicElements> = React.ComponentPropsWithoutRef<T> & {
  type?: 'secondary' | 'success' | 'warning' | 'danger';
};

const toneClass = (type?: BaseProps<'span'>['type']) =>
  type === 'danger'
    ? 'text-[var(--oui-border-invalid)]'
    : type === 'warning'
      ? 'text-amber-700'
      : type === 'success'
        ? 'text-emerald-700'
        : type === 'secondary'
          ? 'text-[var(--oui-foreground-muted)]'
          : 'text-[var(--oui-foreground)]';

function makeTypography<T extends keyof JSX.IntrinsicElements>(tag: T, baseClassName: string, displayName: string) {
  const Component = React.forwardRef<HTMLElement, BaseProps<T>>(({ className, type, ...props }, ref) =>
    React.createElement(tag, { ref, className: cn(baseClassName, toneClass(type), className), ...props }),
  );
  Component.displayName = displayName;
  return React.memo(Component);
}

export const Typography = {
  Text: makeTypography('span', 'font-[family-name:var(--oui-font-sans)] text-sm leading-6', 'TypographyText'),
  Title: makeTypography('h2', 'font-[family-name:var(--oui-font-sans)] text-3xl font-semibold tracking-tight text-balance', 'TypographyTitle'),
  Paragraph: makeTypography('p', 'font-[family-name:var(--oui-font-sans)] text-sm leading-7', 'TypographyParagraph'),
  Link: makeTypography(
    'a',
    'font-[family-name:var(--oui-font-sans)] text-sm font-medium underline decoration-[var(--oui-border-field)] underline-offset-4 transition-colors hover:text-[var(--oui-foreground)] hover:decoration-[var(--oui-border-interactive)]',
    'TypographyLink',
  ),
};
