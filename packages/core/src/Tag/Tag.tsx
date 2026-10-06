import * as React from 'react';
import { Check, X } from 'lucide-react';

import { cn } from 'lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../Tooltip';

export interface TagProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'onCopy'> {
  closable?: boolean;
  onClose?: () => void;
  color?: string;
  /** Monospace face (build tags, shas, keys, timings). */
  mono?: boolean;
  /**
   * Makes the tag a button that copies this text to the clipboard and briefly
   * confirms. Takes precedence over `closable` (a button cannot hold a button).
   */
  copyValue?: string;
  /** Called with the copied text after a successful copy (replaces the DOM clipboard-event `onCopy`). */
  onCopy?: (value: string) => void;
  /** Hover and focus tooltip, e.g. the full value of a shortened tag. */
  tooltip?: React.ReactNode;
}

/** How long the copied confirmation stays on screen. */
const COPIED_MS = 1500;

/**
 * Omni Tag — compact pill for statuses, filters and metadata.
 *
 * @example
 * <Tag color="#2563eb">Published</Tag>
 * <Tag mono copyValue="3f9a1c2d4e" tooltip="3f9a1c2d4e5b6a7f…" onCopy={track}>3f9a1c2 · main</Tag>
 */
export const Tag = ({ closable, onClose, color, mono, copyValue, onCopy, tooltip, className, children, ...props }: TagProps) => {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const copyable = copyValue !== undefined;

  const handleCopy = async () => {
    if (copyValue === undefined || typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(copyValue);
    } catch {
      // Clipboard refused (permissions, insecure context): no confirmation, no callback.
      return;
    }
    onCopy?.(copyValue);
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  };

  const classes = cn(
    'inline-flex min-h-7 items-center gap-1.5 rounded-full border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] px-2.5 py-1 text-xs font-medium text-[var(--oui-foreground)] shadow-xs',
    mono && 'font-mono',
    copyable && 'cursor-pointer transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    className,
  );
  const style = color ? { borderColor: color, color, backgroundColor: `${color}14` } : undefined;

  const tag = copyable ? (
    <button
      type="button"
      data-slot="tag"
      data-mono={mono ? 'true' : undefined}
      data-copied={copied ? 'true' : undefined}
      className={classes}
      style={style}
      onClick={handleCopy}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
      {copied ? <Check aria-hidden="true" className="h-3 w-3" /> : null}
      <span role="status" className="sr-only">
        {copied ? 'Copied' : ''}
      </span>
    </button>
  ) : (
    <span data-slot="tag" data-mono={mono ? 'true' : undefined} className={classes} style={style} {...props}>
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

  if (tooltip === undefined || tooltip === null || tooltip === false) return tag;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{tag}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
