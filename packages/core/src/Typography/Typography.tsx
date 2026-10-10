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

export type TypographyTitleLevel = 1 | 2 | 3 | 4;

export type TypographyTextProps = BaseProps<'span'> & {
  /** Renders `<code>` in the mono font on the field surface. */
  code?: boolean;
  /** Renders `<kbd>`: a key the person presses. */
  keyboard?: boolean;
  /** Heavier weight. */
  strong?: boolean;
};

export type TypographyTitleProps = BaseProps<'h2'> & {
  /** The heading element (`h1` to `h4`) and its size step. Absent: `h2` at its usual size. */
  level?: TypographyTitleLevel;
};

const inlineBox =
  'rounded border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] px-1 py-px font-mono text-[0.92em]';

const TextInner = React.forwardRef<HTMLElement, TypographyTextProps>(
  ({ className, type, size = 'default', code, keyboard, strong, ...props }, ref) =>
    React.createElement(keyboard ? 'kbd' : code ? 'code' : 'span', {
      ref,
      'data-size': size,
      className: cn(
        'font-[family-name:var(--oui-font-sans)]',
        size === 'compact' ? 'text-[13px] leading-[1.45]' : 'text-sm leading-6',
        toneClass(type),
        (code || keyboard) && inlineBox,
        keyboard && 'font-medium shadow-[inset_0_-1px_0_var(--oui-border-field)]',
        strong && 'font-semibold',
        className,
      ),
      ...props,
    }),
);
TextInner.displayName = 'TypographyText';

/** The size step of each level, per `size`. Level 2 is the size a title has without `level`. */
const titleSize: Record<TypographyTitleLevel, Record<TypographySize, string>> = {
  1: { default: 'text-4xl', compact: 'text-2xl' },
  2: { default: 'text-3xl', compact: 'text-xl' },
  3: { default: 'text-2xl', compact: 'text-lg' },
  4: { default: 'text-xl', compact: 'text-base' },
};

const TitleInner = React.forwardRef<HTMLHeadingElement, TypographyTitleProps>(
  ({ className, type, size = 'default', level, ...props }, ref) =>
    React.createElement(`h${level ?? 2}`, {
      ref,
      'data-size': size,
      className: cn(
        'font-[family-name:var(--oui-font-sans)] font-semibold tracking-tight text-balance',
        titleSize[level ?? 2][size],
        toneClass(type),
        className,
      ),
      ...props,
    }),
);
TitleInner.displayName = 'TypographyTitle';

export const Typography = {
  Text: React.memo(TextInner),
  Title: React.memo(TitleInner),
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
