import * as React from 'react';

import { cn } from 'lib/utils';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  preview?: boolean;
}

export const Image = React.memo(
  React.forwardRef<HTMLImageElement, ImageProps>(({ className, alt = '', ...props }, ref) => <img ref={ref} alt={alt} className={cn('max-w-full rounded-md', className)} {...props} />),
);
Image.displayName = 'Image';
