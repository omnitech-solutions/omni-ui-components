import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Classes of one Rate mark (the `role="radio"` button). The filled mark is drawn in the warning tone: the solid
 * colour inside, the tone's text colour as the outline, so the shape keeps its contrast on a light surface.
 *
 * @example
 * <button className={rateMarkVariants({ size: 'lg', filled: true })} />
 */
export const rateMarkVariants = cva(
  [
    'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-sm bg-transparent p-0',
    'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--oui-border-interactive)]',
    'transition-[color,transform] duration-[var(--oui-transition-duration)] ease-[var(--oui-transition-easing)]',
    'motion-reduce:transition-none',
    'disabled:cursor-not-allowed',
    '[&_svg]:size-full',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'size-4',
        default: 'size-5',
        md: 'size-6',
        lg: 'size-8',
      },
      filled: {
        true: 'text-[var(--oui-tone-warning-fg)] [&_svg]:fill-[var(--oui-tone-warning-solid-bg)]',
        false: 'text-[var(--oui-foreground-muted)] [&_svg]:fill-transparent',
      },
      interactive: {
        true: 'hover:scale-110 motion-reduce:hover:scale-100',
        false: 'cursor-default',
      },
    },
    defaultVariants: { size: 'default', filled: false, interactive: true },
  },
);

export type RateSize = NonNullable<VariantProps<typeof rateMarkVariants>['size']>;
