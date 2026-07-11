import * as React from 'react';

import { cn } from 'lib/utils';

export interface QRCodeProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  size?: number;
}

export const QRCode = ({ value, size = 160, className, ...props }: QRCodeProps) => (
  <div
    className={cn('grid place-items-center rounded-lg border bg-white p-2 text-black', className)}
    style={{ width: size, height: size }}
    {...props}
  >
    <div className="grid h-full w-full grid-cols-9 gap-px bg-black p-1">
      {Array.from({ length: 81 }, (_, index) => {
        const filled = ((value.charCodeAt(index % value.length) || 0) + index) % 2 === 0;
        return <div key={index} className={filled ? 'bg-black' : 'bg-white'} />;
      })}
    </div>
  </div>
);
