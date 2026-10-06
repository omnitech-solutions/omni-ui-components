import * as React from 'react';
import { Trash2 } from 'lucide-react';

import { cn } from 'lib/utils';
import { toneBadgeClasses } from '../internal/support/controlTone';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../Tooltip';
import { iconButtonVariants } from './IconButton.variants';
import type { IconButtonProps } from './IconButton.types';

/**
 * Trash2 from lucide-react implies a destructive action — auto-default
 * the variant to `destructive` so callers don't have to repeat themselves.
 */
const isTrashIcon = (icon: React.ReactNode): boolean =>
  React.isValidElement(icon) && (icon.type === Trash2 || (icon.type as { displayName?: string })?.displayName === 'Trash2');

/**
 * Omni IconButton — square, icon-only button used by RJSF array
 * toolbars (copy / move / remove) and other compact affordances. Sizes
 * track the Omni field-height scale so the button sits cleanly next to
 * Input / Select / Textarea rows.
 *
 * Mirrors `@rjsf/shadcn`'s IconButton API (`icon`, `variant`, size). One
 * of `label` / `aria-label` / `title` is required for a11y; the wrapper
 * does not enforce this at the type level so the props stay structurally
 * compatible with RJSF's `IconButtonProps`.
 *
 * Configuration-driven variations: `tone`, `pressed`, `badge`, `tooltip`,
 * `disabledReason` and the `control` / `control-labelled` sizes. Callbacks
 * are ordinary props (`onClick`).
 *
 * @example
 * <IconButton aria-label="Remove" icon={<Trash2 />} variant="destructive" onClick={…} />
 * <IconButton label="Microphone" icon={<Mic />} iconSize="control" tone="warning"
 *   badge={{ tone: 'warning', label: '!', description: 'Microphone lost' }} tooltip="Microphone lost. Trying again." />
 * <IconButton label="Capture" icon={<Camera />} disabledReason="Resume to capture" />
 */
const IconButtonInner = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { icon, variant, iconSize, tone, pressed, badge, tooltip, disabledReason, label, title, className, type = 'button', disabled, onClick, ...rest },
    ref,
  ) => {
    const restAny = rest as Record<string, unknown>;
    const ariaLabel = label ?? (restAny['aria-label'] as string | undefined);
    // A tone replaces the variant colours, so it sits on the quiet `secondary` base unless a variant is asked for.
    const resolvedVariant = variant ?? (tone ? 'secondary' : isTrashIcon(icon) ? 'destructive' : 'outline');
    const badgeDescriptionId = React.useId();
    const reasoned = disabledReason !== undefined && disabledReason !== '';
    const tipContent = reasoned ? disabledReason : tooltip;
    const hasTip = tipContent !== undefined && tipContent !== null && tipContent !== false;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      // aria-disabled keeps the button hoverable for the tooltip, so the click must be swallowed here.
      if (reasoned) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    const button = (
      <button
        ref={ref}
        type={type}
        title={hasTip ? undefined : (title ?? ariaLabel)}
        aria-label={ariaLabel}
        aria-pressed={pressed}
        aria-disabled={reasoned ? true : undefined}
        aria-describedby={badge?.description ? badgeDescriptionId : undefined}
        disabled={reasoned ? undefined : disabled}
        data-slot="icon-button"
        data-variant={resolvedVariant}
        data-icon-size={iconSize ?? 'default'}
        data-tone={tone}
        data-disabled={reasoned ? '' : undefined}
        className={cn(iconButtonVariants({ variant: resolvedVariant, iconSize, tone }), badge && 'relative', className)}
        onClick={handleClick}
        {...rest}
      >
        {icon}
        {badge ? (
          <>
            <span
              data-slot="icon-button-badge"
              data-tone={badge.tone}
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute top-[var(--oui-badge-offset)] right-[var(--oui-badge-offset)]',
                'flex size-[var(--oui-badge-size)] items-center justify-center rounded-full text-[11px] leading-none font-bold',
                'shadow-[0_0_0_2px_var(--oui-badge-ring)]',
                toneBadgeClasses[badge.tone],
              )}
            >
              {badge.label}
            </span>
            {badge.description ? (
              <span id={badgeDescriptionId} className="sr-only">
                {badge.description}
              </span>
            ) : null}
          </>
        ) : null}
      </button>
    );

    if (!hasTip) return button;
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>{tipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);
IconButtonInner.displayName = 'IconButton';

export const IconButton = React.memo(IconButtonInner) as typeof IconButtonInner;
