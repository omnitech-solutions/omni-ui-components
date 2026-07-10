import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Tailwind class config for the Select primitive. Shares the Input
 * variant + size scale so `<Select selectSize="md">` reads the same
 * metrics as `<Input inputSize="md">`. Tokens come from
 * `omni-ui-components/styles/tokens.css`.
 */
export const selectVariants = cva(
  [
    'box-border flex w-full min-w-0',
    'appearance-none cursor-pointer',
    'rounded-[var(--oui-radius-field)]',
    'font-[family-name:var(--oui-font-sans)] text-sm',
    'text-[var(--oui-foreground)]',
    'border',
    'outline-none',
    'pr-9',
    /* chevron indicator via background SVG (matches shadcn fancy-select) */
    "bg-[url('data:image/svg+xml,%3Csvg xmlns%3D%22http%3A//www.w3.org/2000/svg%22 width%3D%2212%22 height%3D%2212%22 viewBox%3D%220 0 24 24%22 fill%3D%22none%22 stroke%3D%22currentColor%22 stroke-width%3D%222%22 stroke-linecap%3D%22round%22 stroke-linejoin%3D%22round%22%3E%3Cpolyline points%3D%226 9 12 15 18 9%22/%3E%3C/svg%3E')]",
    'bg-no-repeat bg-[length:14px_14px] bg-[position:right_0.75rem_center]',
    'transition-[border-color,background-color,box-shadow]',
    'duration-[var(--oui-transition-duration)]',
    'ease-[var(--oui-transition-easing)]',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'aria-invalid:border-[var(--oui-border-invalid)] aria-invalid:ring-0',
    'data-[state=invalid]:border-[var(--oui-border-invalid)]',
    'data-[placeholder=true]:text-[var(--oui-foreground-placeholder)]',
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
      selectSize: {
        sm: 'h-[var(--oui-field-height-sm)] pl-[var(--oui-field-padding-x)] text-xs',
        default: 'h-[var(--oui-field-height-md)] pl-[var(--oui-field-padding-x)] py-1.5',
        md: 'h-[var(--oui-field-height-lg)] pl-[var(--oui-field-padding-x)] py-2',
        lg: 'h-[var(--oui-field-height-xl)] pl-4 text-base',
      },
    },
    defaultVariants: { variant: 'bordered', selectSize: 'default' },
  },
);

export type SelectVariantProps = VariantProps<typeof selectVariants>;
export type SelectVariant = NonNullable<SelectVariantProps['variant']>;
export type SelectSize = NonNullable<SelectVariantProps['selectSize']>;
