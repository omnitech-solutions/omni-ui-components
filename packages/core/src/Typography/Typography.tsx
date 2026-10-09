import { cn } from 'lib/utils';
import * as React from 'react';

type BaseProps<T extends keyof JSX.IntrinsicElements> = React.ComponentPropsWithoutRef<T> & {
  type?: 'secondary' | 'success' | 'warning' | 'danger';
  /**
   * `compact`: one step smaller and tighter, for dense surfaces such as a side
   * panel or a list of facts. Default `default`.
   */
  size?: TypographySize;
};

export type TypographySize = 'default' | 'compact';

const toneClass = (type?: BaseProps<'span'>['type']) =>
  type === 'danger'
    ? 'text-[var(--oui-border-invalid)]'
    : type === 'warning'
      ? 'text-[color:var(--oui-tone-warning-fg)]'
      : type === 'success'
        ? 'text-[color:var(--oui-tone-success-fg)]'
        : type === 'secondary'
          ? 'text-[var(--oui-foreground-muted)]'
          : 'text-[var(--oui-foreground)]';

function makeTypography<T extends keyof JSX.IntrinsicElements>(
  tag: T,
  baseClassName: string,
  /** The size and rhythm of each `size`; everything else is in `baseClassName`. */
  sizeClassName: Record<TypographySize, string>,
  displayName: string,
) {
  const Component = React.forwardRef<HTMLElement, BaseProps<T>>(
    ({ className, type, size = 'default', ...props }, ref) =>
      React.createElement(tag, {
        ref,
        'data-size': size,
        className: cn(baseClassName, sizeClassName[size], toneClass(type), className),
        ...props,
      }),
  );
  Component.displayName = displayName;
  return React.memo(Component);
}

export const Typography = {
  Text: makeTypography(
    'span',
    'font-[family-name:var(--oui-font-sans)]',
    { default: 'text-sm leading-6', compact: 'text-[13px] leading-[1.45]' },
    'TypographyText',
  ),
  Title: makeTypography(
    'h2',
    'font-[family-name:var(--oui-font-sans)] font-semibold tracking-tight text-balance',
    { default: 'text-3xl', compact: 'text-xl' },
    'TypographyTitle',
  ),
  Paragraph: makeTypography(
    'p',
    'font-[family-name:var(--oui-font-sans)]',
    { default: 'text-sm leading-7', compact: 'text-[13px] leading-[1.5]' },
    'TypographyParagraph',
  ),
  Link: makeTypography(
    'a',
    'font-[family-name:var(--oui-font-sans)] font-medium underline decoration-[var(--oui-border-field)] underline-offset-4 transition-colors hover:text-[var(--oui-foreground)] hover:decoration-[var(--oui-border-interactive)]',
    { default: 'text-sm', compact: 'text-[13px]' },
    'TypographyLink',
  ),
};
