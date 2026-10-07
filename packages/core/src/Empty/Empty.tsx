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
}

export const Empty = ({
  variant = 'dashed',
  image,
  icon,
  title,
  description = 'No data',
  action,
  className,
  children,
  ...props
}: EmptyProps) => {
  if (variant === 'tile') {
    const glyph = icon ?? image;
    return (
      <div
        data-slot="empty"
        data-variant="tile"
        className={cn(
          'flex flex-1 flex-col items-center justify-center gap-[10px] p-5 text-center',
          className,
        )}
        {...props}
      >
        <span
          data-slot="empty-tile"
          aria-hidden="true"
          className="box-border flex size-10 items-center justify-center rounded-[var(--oui-control-radius)] bg-[color:var(--oui-tone-accent-bg)] text-[color:var(--oui-tone-neutral-fg)] [&_svg]:size-[var(--oui-control-icon)]"
        >
          {glyph ?? <Inbox />}
        </span>
        {title ? (
          <span data-slot="empty-title" className="text-[15px] leading-snug font-semibold">
            {title}
          </span>
        ) : null}
        <span
          data-slot="empty-description"
          className="max-w-[340px] text-[13px] leading-normal text-[color:var(--oui-tone-neutral-fg)] opacity-75"
        >
          {description}
        </span>
        {action ? (
          <Button
            buttonSize="control"
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
      className={cn(
        'flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-10 text-center',
        className,
      )}
      {...props}
    >
      <div className="text-muted-foreground">{image ?? <Inbox className="h-8 w-8" />}</div>
      <div className="text-sm text-muted-foreground">{description}</div>
      {children}
    </div>
  );
};
