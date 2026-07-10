import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Tailwind class config for the Input primitive. All colors and metrics
 * come from `omni-ui-components/styles/tokens.css` so retheming a subtree
 * is a CSS-variable override, not a component change.
 *
 * @example
 * <input className={inputVariants({ variant: 'bordered', inputSize: 'md' })} />
 */
export const inputVariants = cva(
  [
    'box-border flex w-full min-w-0',
    'rounded-[var(--oui-radius-field)]',
    'font-[family-name:var(--oui-font-sans)] text-sm',
    'text-[var(--oui-foreground)]',
    'border',
    'outline-none',
    'transition-[border-color,background-color,box-shadow]',
    'duration-[var(--oui-transition-duration)]',
    'ease-[var(--oui-transition-easing)]',
    'placeholder:font-[family-name:var(--oui-font-sans)]',
    'placeholder:text-[var(--oui-foreground-placeholder)]',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'read-only:cursor-default',
    'aria-invalid:border-[var(--oui-border-invalid)] aria-invalid:ring-0',
    'data-[state=invalid]:border-[var(--oui-border-invalid)]',
  ].join(' '),
  {
    variants: {
      variant: {
        bordered: [
          'border-[var(--oui-border-field)]',
          'bg-[var(--oui-surface-field)]',
          'hover:border-[var(--oui-border-interactive)]',
          'focus-visible:border-[var(--oui-border-interactive)]',
          'focus-visible:ring-0',
          'disabled:bg-[var(--oui-surface-field-disabled)]',
        ].join(' '),
        ghost: [
          'border-transparent bg-transparent shadow-none ring-0',
          'hover:border-transparent',
          'focus-visible:border-transparent focus-visible:ring-0',
        ].join(' '),
      },
      inputSize: {
        sm: 'h-[var(--oui-field-height-sm)] px-[var(--oui-field-padding-x)] text-xs',
        default: 'h-[var(--oui-field-height-md)] px-[var(--oui-field-padding-x)] py-1.5',
        md: 'h-[var(--oui-field-height-lg)] px-[var(--oui-field-padding-x)] py-2',
        lg: 'h-[var(--oui-field-height-xl)] px-4 text-base',
      },
    },
    defaultVariants: { variant: 'bordered', inputSize: 'default' },
  },
);

export type InputVariantProps = VariantProps<typeof inputVariants>;
export type InputVariant = NonNullable<InputVariantProps['variant']>;
export type InputSize = NonNullable<InputVariantProps['inputSize']>;

/**
 * Field-group layout variants. `vertical` stacks label / input / helpers
 * (default form layout). `horizontal` aligns the label inline on the left
 * with a fixed-width column and lets the input flex (PropertyRow pattern).
 *
 * @example
 * <div className={fieldGroupVariants({ layout: 'horizontal' })}>…</div>
 */
export const fieldGroupVariants = cva('font-[family-name:var(--oui-font-sans)] flex w-full', {
  variants: {
    layout: {
      vertical: 'flex-col gap-1.5',
      horizontal: 'flex-row items-center gap-2.5',
    },
  },
  defaultVariants: { layout: 'vertical' },
});

export const fieldLabelVariants = cva('font-[family-name:var(--oui-font-sans)] text-sm text-[var(--oui-foreground)]', {
  variants: {
    layout: {
      vertical: 'font-semibold',
      horizontal: 'shrink-0 w-[var(--oui-label-width,7.5rem)] font-normal text-[var(--oui-foreground-muted)]',
    },
  },
  defaultVariants: { layout: 'vertical' },
});

export type FieldLayoutProps = VariantProps<typeof fieldGroupVariants>;
export type FieldLayout = NonNullable<FieldLayoutProps['layout']>;
