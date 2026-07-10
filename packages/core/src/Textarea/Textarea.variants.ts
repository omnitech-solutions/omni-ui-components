import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Tailwind class config for the Textarea primitive. Shares the Input
 * variant + size scale so a `<Textarea size="md">` reads the same metrics
 * as `<Input inputSize="md">`. Colors and metrics come from
 * `omni-ui-components/styles/tokens.css`.
 *
 * @example
 * <textarea className={textareaVariants({ variant: 'bordered', textareaSize: 'default' })} />
 */
export const textareaVariants = cva(
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
    'resize-y',
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
      textareaSize: {
        sm: 'px-[var(--oui-field-padding-x)] py-1.5 text-xs',
        default: 'px-[var(--oui-field-padding-x)] py-2',
        md: 'px-[var(--oui-field-padding-x)] py-2.5',
        lg: 'px-4 py-3 text-base',
      },
    },
    defaultVariants: { variant: 'bordered', textareaSize: 'default' },
  },
);

export type TextareaVariantProps = VariantProps<typeof textareaVariants>;
export type TextareaVariant = NonNullable<TextareaVariantProps['variant']>;
export type TextareaSize = NonNullable<TextareaVariantProps['textareaSize']>;
