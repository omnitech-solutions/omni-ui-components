import { cn } from 'lib/utils';
import type * as React from 'react';
import { type ControlTone, toneBadgeClasses } from './controlTone';

export interface ControlBadgeProps {
  tone: ControlTone;
  /** Short visible glyph or count, e.g. `'!'`. Omit for a plain dot. */
  label?: string;
  /** Spoken description, wired through `aria-describedby` by the owner via `descriptionId`. */
  description?: string;
  descriptionId?: string;
  /** Owning slot name, e.g. `icon-button-badge`. */
  slot: string;
  /** Extra classes (e.g. a smaller corner offset). */
  className?: string;
}

/**
 * The small status badge at a control's top-right corner (the amber "!"). It is
 * absolutely positioned, so the owning control must be `relative`. The ring cuts
 * it out of the surface behind (`--oui-badge-ring`).
 */
export const ControlBadge: React.FC<ControlBadgeProps> = ({
  tone,
  label,
  description,
  descriptionId,
  slot,
  className,
}) => (
  <>
    <span
      data-slot={slot}
      data-tone={tone}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute top-[var(--oui-badge-offset)] right-[var(--oui-badge-offset)]',
        'flex size-[var(--oui-badge-size)] items-center justify-center rounded-full text-[11px] leading-none font-bold',
        'shadow-[0_0_0_2px_var(--oui-badge-ring)]',
        toneBadgeClasses[tone],
        className,
      )}
    >
      {label}
    </span>
    {description ? (
      <span id={descriptionId} className="sr-only">
        {description}
      </span>
    ) : null}
  </>
);
