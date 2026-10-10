import { cn } from 'lib/utils';
import { Star } from 'lucide-react';
import * as React from 'react';

export interface RateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  count?: number;
  value?: number;
  defaultValue?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
  /** Names a star for assistive technology. Defaults to `1 star`, `2 stars`, … */
  starLabel?: (value: number, count: number) => string;
}

const defaultStarLabel = (value: number) => `${value} ${value === 1 ? 'star' : 'stars'}`;

export function Rate({
  count = 5,
  value,
  defaultValue = 0,
  disabled,
  onChange,
  starLabel = defaultStarLabel,
  className,
  ...props
}: RateProps) {
  const controlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const current = controlled ? value : internal;

  const select = (next: number) => {
    if (disabled) return;
    if (!controlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <div className={cn('flex items-center gap-1', className)} {...props}>
      {Array.from({ length: count }, (_, index) => {
        const selected = index < current;
        return (
          <button
            key={index}
            type="button"
            disabled={disabled}
            aria-label={starLabel(index + 1, count)}
            aria-pressed={selected}
            onClick={() => select(index + 1)}
            className="disabled:cursor-not-allowed"
          >
            <Star
              aria-hidden="true"
              className={cn(
                'h-5 w-5',
                selected ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
