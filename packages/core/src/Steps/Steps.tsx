import * as React from 'react';
import { cn } from 'lib/utils';

export type StepItem = { key?: React.Key; title: React.ReactNode; description?: React.ReactNode; status?: 'wait' | 'process' | 'finish' | 'error'; disabled?: boolean };
export interface StepsProps extends Omit<React.HTMLAttributes<HTMLOListElement>, 'onChange'> {
  items?: StepItem[];
  current?: number;
  direction?: 'horizontal' | 'vertical';
  size?: 'default' | 'small';
  status?: 'wait' | 'process' | 'finish' | 'error';
  onChange?: (current: number) => void;
}

export const Steps = React.forwardRef<HTMLOListElement, StepsProps>(({ items = [], current = 0, direction = 'horizontal', size = 'default', status = 'process', onChange, className, ...props }, ref) => (
  <ol ref={ref} aria-label="Steps" className={cn('m-0 flex list-none items-start gap-4 p-0', direction === 'vertical' && 'flex-col', size === 'small' && 'text-sm', className)} {...props}>
    {items.map((item, index) => {
      const itemStatus = item.status ?? (index < current ? 'finish' : index === current ? status : 'wait');
      return <li key={item.key ?? index} className={cn('flex min-w-0 gap-2', direction === 'horizontal' && 'flex-1')}>
        <button type="button" disabled={item.disabled} aria-current={index === current ? 'step' : undefined} className={cn('flex appearance-none gap-2 border-0 bg-transparent p-0 text-left', itemStatus === 'process' && 'text-primary', itemStatus === 'finish' && 'text-primary', itemStatus === 'error' && 'text-destructive')} onClick={() => onChange?.(index)}>
          <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full border">{index + 1}</span>
          <span><span className="block font-medium">{item.title}</span>{item.description && <span className="text-muted-foreground">{item.description}</span>}</span>
        </button>
      </li>;
    })}
  </ol>
));
Steps.displayName = 'Steps';
