import { cn } from 'lib/utils';
import { Inbox } from 'lucide-react';
import type * as React from 'react';
import { Button } from '../Button';
import type { ControlTone } from '../internal/support/controlTone';

/** The optional call to action under an Empty `tile`, rendered with the library Button. */
export interface EmptyAction {
  label: React.ReactNode;
  onClick: () => void;
  /** Button tone from the shared scale. Default `accent`. */
  tone?: ControlTone;
  /** Optional leading icon node. */
  icon?: React.ReactNode;
  /** Optional shortcut text after the label, one entry per key: `['⌘', '⇧', 'S']`. */
  shortcut?: string[];
}

export interface EmptyProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** `dashed` (default): the bordered blank-state box. `tile`: panel empty state with a 40px icon tile. */
  variant?: 'dashed' | 'tile';
  image?: React.ReactNode;
  /** `tile`: the icon node shown inside the 40px tile (falls back to `image`). */
  icon?: React.ReactNode;
  /** `tile`: optional bold title above the description. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** `tile`: optional action button under the description. */
  action?: EmptyAction;
  /**
   * `compact`: a single quiet row (a small icon beside the description), for a
   * dense surface where a full blank state would take over. Default `default`.
   */
  size?: EmptySize;
}

export type EmptySize = 'default' | 'compact';

export const Empty = ({
  variant = 'dashed',
  image,
  icon,
  title,
  description = 'No data',
  action,
  size = 'default',
  className,
  children,
  ...props
}: EmptyProps) => {
  const compact = size === 'compact';
  if (variant === 'tile') {
    const glyph = icon ?? image;
    return (
      <div
        data-slot="empty"
        data-variant="tile"
        data-size={size}
        className={cn(
          compact
            ? 'flex flex-wrap items-center gap-2 px-1 py-1.5 text-left'
            : 'flex flex-1 flex-col items-center justify-center gap-[10px] p-5 text-center',
          className,
        )}
        {...props}
      >
        <span
          data-slot="empty-tile"
          aria-hidden="true"
          className={cn(
            'box-border flex shrink-0 items-center justify-center rounded-[var(--oui-control-radius)] bg-[color:var(--oui-tone-accent-bg)] text-[color:var(--oui-tone-neutral-fg)]',
            compact ? 'size-6 [&_svg]:size-3.5' : 'size-10 [&_svg]:size-[var(--oui-control-icon)]',
          )}
        >
          {glyph ?? <Inbox />}
        </span>
        {title ? (
          <span
            data-slot="empty-title"
            className={cn('leading-snug font-semibold', compact ? 'text-[13px]' : 'text-[15px]')}
          >
            {title}
          </span>
        ) : null}
        <span
          data-slot="empty-description"
          className={cn(
            'leading-normal text-[color:var(--oui-tone-neutral-fg)] opacity-75',
            compact ? 'min-w-0 flex-1 text-[13px]' : 'max-w-[340px] text-[13px]',
          )}
        >
          {description}
        </span>
        {action ? (
          <Button
            buttonSize={compact ? 'sm' : 'control'}
            tone={action.tone ?? 'accent'}
            icon={action.icon}
            shortcut={action.shortcut}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ) : null}
        {children}
      </div>
    );
  }

  return (
    <div
      data-size={size}
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed text-center',
        compact ? 'gap-1.5 px-3 py-4' : 'min-h-48 gap-3 px-6 py-10',
        className,
      )}
      {...props}
    >
      <div className="text-muted-foreground">
        {image ?? <Inbox className={compact ? 'h-5 w-5' : 'h-8 w-8'} />}
      </div>
      <div className="text-sm text-muted-foreground">{description}</div>
      {children}
    </div>
  );
};
