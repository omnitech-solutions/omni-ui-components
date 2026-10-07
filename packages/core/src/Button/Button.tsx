import { Slot, Slottable } from '@radix-ui/react-slot';
import { cn } from 'lib/utils';
import { LoaderCircle } from 'lucide-react';
import * as React from 'react';
import type { ButtonProps } from './Button.types';
import { buttonVariants } from './Button.variants';

/** macOS modifier glyph → `aria-keyshortcuts` token. */
const KEY_ARIA: Record<string, string> = { '⌘': 'Meta', '⌥': 'Alt', '⇧': 'Shift', '⌃': 'Control' };

/** `['⌘','⇧','S']` → `"Meta+Shift+S"` (omitted when a key has no known token). */
const toAriaKeyShortcuts = (keys: string[]): string =>
  keys.map((k) => KEY_ARIA[k] ?? (k.length === 1 ? k.toUpperCase() : k)).join('+');

/**
 * Omni Button — namespaced wrapper over the shadcn Button shape, with
 * Omni field-height tokens + design-system palette. Use this in place
 * of `components/ui/button` for any new omni-ui-components feature
 * surface so the look stays consistent with Input / Select / Slider.
 *
 * Configuration-driven variations: `tone` (+ `soft`), the `control` /
 * `control-labelled` sizes, `fillIcon`, `shortcut`, `loading`, `pressed`,
 * `labelMaxWidth` and `asChild`. Callbacks are ordinary props (`onClick`).
 *
 * @example
 * <Button variant="default" buttonSize="default" onClick={save}>Save</Button>
 * <Button variant="destructive" icon={<Trash2 />}>Delete</Button>
 * <Button buttonSize="control" tone="danger" soft onClick={end}>End session</Button>
 * <Button buttonSize="control" shortcut={['⌘', '⇧', 'S']}>Capture</Button>
 * <Button asChild><a href="/docs">Docs</a></Button>
 */
const ButtonInner = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      buttonSize,
      tone,
      soft,
      fillIcon,
      icon,
      iconAfter,
      shortcut,
      loading = false,
      pressed,
      labelMaxWidth,
      asChild = false,
      type = 'button',
      disabled,
      onClick,
      title,
      children,
      ...rest
    },
    ref,
  ) => {
    const inactive = Boolean(disabled) || loading;

    // Truncation: the full label becomes the title only while the label is actually cut.
    const labelRef = React.useRef<HTMLSpanElement>(null);
    const [truncatedLabel, setTruncatedLabel] = React.useState<string | undefined>();
    React.useLayoutEffect(() => {
      const el = labelRef.current;
      if (!el || labelMaxWidth === undefined) {
        setTruncatedLabel(undefined);
        return;
      }
      const measure = () =>
        setTruncatedLabel(
          el.scrollWidth > el.clientWidth ? (el.textContent ?? undefined) : undefined,
        );
      measure();
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => observer.disconnect();
    }, [labelMaxWidth, children]);

    const leading = loading ? (
      <LoaderCircle data-slot="button-spinner" aria-hidden="true" className="animate-spin" />
    ) : (
      icon
    );
    const maxWidth = typeof labelMaxWidth === 'number' ? `${labelMaxWidth}px` : labelMaxWidth;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      // Native disabled blocks clicks for <button>; an asChild anchor needs the guard.
      if (inactive) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    const shortcutNode =
      shortcut && shortcut.length > 0 ? (
        <span
          data-slot="button-shortcut"
          aria-hidden="true"
          className="ml-1 font-mono text-[11px] leading-none opacity-70"
        >
          {shortcut.join('')}
        </span>
      ) : null;

    const labelled = (content: React.ReactNode) =>
      labelMaxWidth === undefined ? (
        content
      ) : (
        <span ref={labelRef} data-slot="button-label" className="truncate" style={{ maxWidth }}>
          {content}
        </span>
      );

    const shared = {
      'data-slot': 'button',
      'data-variant': variant ?? 'default',
      'data-button-size': buttonSize ?? 'default',
      'data-tone': tone,
      'data-loading': loading ? 'true' : undefined,
      'aria-busy': loading ? true : undefined,
      'aria-pressed': pressed,
      'aria-keyshortcuts':
        shortcut && shortcut.length > 0 ? toAriaKeyShortcuts(shortcut) : undefined,
      title: title ?? truncatedLabel,
      className: cn(buttonVariants({ variant, buttonSize, tone, soft, fillIcon }), className),
      onClick: handleClick,
    } as const;

    if (asChild) {
      // One child element becomes the button; icon, label and shortcut render inside it.
      return (
        <Slot
          ref={ref as React.Ref<HTMLElement>}
          {...shared}
          aria-disabled={inactive ? true : undefined}
          tabIndex={inactive ? -1 : undefined}
          {...(rest as React.HTMLAttributes<HTMLElement>)}
        >
          {leading}
          <Slottable>{children}</Slottable>
          {iconAfter}
          {shortcutNode}
        </Slot>
      );
    }

    return (
      <button ref={ref} type={type} disabled={inactive} {...shared} {...rest}>
        {leading}
        {labelled(children)}
        {iconAfter}
        {shortcutNode}
      </button>
    );
  },
);
ButtonInner.displayName = 'Button';

export const Button = React.memo(ButtonInner) as typeof ButtonInner;
