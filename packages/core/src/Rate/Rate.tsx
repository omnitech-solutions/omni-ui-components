import * as React from 'react';
import { Star } from 'lucide-react';

import { cn } from 'lib/utils';

export interface RateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  count?: number;
  value?: number;
  defaultValue?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
}

export function Rate({ count = 5, value, defaultValue = 0, disabled, onChange, className, ...props }: RateProps) {
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
          <button key={index} type="button" disabled={disabled} onClick={() => select(index + 1)} className="disabled:cursor-not-allowed">
            <Star className={cn('h-5 w-5', selected ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')} />
          </button>
        );
      })}
    </div>
  );
}
