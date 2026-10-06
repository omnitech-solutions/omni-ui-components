import { cva } from 'class-variance-authority';

export const toastVariants = cva(
  'z-50 flex max-w-[min(calc(100vw-2rem),420px)] items-center gap-3 rounded-xl border border-solid border-[color:var(--oui-panel-border)] bg-[color:var(--oui-panel-bg)] px-3.5 py-2.5 text-[13px] text-[color:var(--oui-tone-neutral-fg)] shadow-xl motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2',
  {
    variants: {
      position: { fixed: 'fixed', absolute: 'absolute' },
      placement: {
        'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
        'bottom-left': 'bottom-4 left-4',
        'bottom-right': 'right-4 bottom-4',
        'top-center': 'top-4 left-1/2 -translate-x-1/2',
        'top-left': 'top-4 left-4',
        'top-right': 'top-4 right-4',
      },
    },
    defaultVariants: { position: 'fixed', placement: 'bottom-center' },
  },
);
