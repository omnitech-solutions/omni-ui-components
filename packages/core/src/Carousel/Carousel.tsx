import { cn } from 'lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { Button } from '../Button';

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  /** Names of the two buttons, for assistive technology. */
  labels?: { previous?: string; next?: string };
}

export function Carousel({ children, className, labels, ...props }: CarouselProps) {
  const items = React.Children.toArray(children);
  const [index, setIndex] = React.useState(0);
  const current = items[index] ?? null;

  return (
    <div className={cn('space-y-3', className)} {...props}>
      <div className="overflow-hidden rounded-lg border bg-background">{current}</div>
      {items.length > 1 ? (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            buttonSize="sm"
            onClick={() => setIndex((value) => (value - 1 + items.length) % items.length)}
            aria-label={labels?.previous ?? 'Previous slide'}
            icon={<ChevronLeft aria-hidden="true" className="h-4 w-4" />}
          />
          <div className="text-sm text-muted-foreground">{`${index + 1} / ${items.length}`}</div>
          <Button
            variant="outline"
            buttonSize="sm"
            onClick={() => setIndex((value) => (value + 1) % items.length)}
            aria-label={labels?.next ?? 'Next slide'}
            icon={<ChevronRight aria-hidden="true" className="h-4 w-4" />}
          />
        </div>
      ) : null}
    </div>
  );
}
