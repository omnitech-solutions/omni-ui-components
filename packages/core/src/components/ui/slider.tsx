'use client';

import * as React from 'react';
import { Range, Root, Thumb, Track } from '@radix-ui/react-slider';

import { cn } from 'lib/utils';

/**
 * Shadcn-style Slider primitive. Omni wraps this in
 * `omni-ui-components/Slider` — feature code should import from there.
 */
function Slider({ className, defaultValue, value, min = 0, max = 100, ...props }: React.ComponentProps<typeof Root>) {
  const thumbCount = React.useMemo(() => {
    if (Array.isArray(value)) return value.length;
    if (Array.isArray(defaultValue)) return defaultValue.length;
    return 1;
  }, [value, defaultValue]);

  return (
    <Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none items-center select-none cursor-pointer data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
        /* expanded hit area: 20px tall click target around the thin track */
        'data-[orientation=horizontal]:h-5 data-[orientation=horizontal]:py-2',
        'data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-5 data-[orientation=vertical]:px-2 data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    >
      <Track
        data-slot="slider-track"
        className={cn(
          'relative grow overflow-hidden rounded-full bg-muted',
          'data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full',
          'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5',
        )}
      >
        <Range data-slot="slider-range" className={cn('absolute bg-primary', 'data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full')} />
      </Track>
      {Array.from({ length: thumbCount }, (_, index) => (
        <Thumb
          key={index}
          data-slot="slider-thumb"
          className={cn(
            'block size-4 shrink-0 rounded-full border-2 border-primary bg-background shadow-sm',
            'cursor-grab active:cursor-grabbing',
            'ring-ring/50 transition-[color,box-shadow,transform]',
            'hover:ring-4 focus-visible:ring-4 focus-visible:outline-none',
            'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        />
      ))}
    </Root>
  );
}

export { Slider };
