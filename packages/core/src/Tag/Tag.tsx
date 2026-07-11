import * as React from 'react';
import { X } from 'lucide-react';

import { cn } from 'lib/utils';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  closable?: boolean;
  onClose?: () => void;
  color?: string;
}

export const Tag = ({ closable, onClose, color, className, children, ...props }: TagProps) => (
  <span
    className={cn(
      'inline-flex min-h-7 items-center gap-1.5 rounded-full border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] px-2.5 py-1 text-xs font-medium text-[var(--oui-foreground)] shadow-xs',
      className,
    )}
    style={color ? { borderColor: color, color, backgroundColor: `${color}14` } : undefined}
    {...props}
  >
    {children}
    {closable ? (
      <button
        type="button"
        aria-label="Remove tag"
        onClick={onClose}
        className="rounded-full border border-transparent p-0.5 text-[var(--oui-foreground-muted)] transition-colors hover:border-[var(--oui-border-field)] hover:bg-muted/40 hover:text-[var(--oui-foreground)]"
      >
        <X className="h-3 w-3" />
      </button>
    ) : null}
  </span>
);
