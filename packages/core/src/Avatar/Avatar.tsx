import * as React from 'react';

import { Avatar as AvatarPrimitive, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import type { AvatarFallbackProps, AvatarImageProps, AvatarProps } from './Avatar.types';

const AvatarInner = React.forwardRef<HTMLSpanElement, AvatarProps>(({ fallback, src, alt, children, ...props }, ref) => (
  <AvatarPrimitive ref={ref} {...props}>
    {src ? <AvatarImage src={src} alt={alt} /> : null}
    {fallback ? <AvatarFallback>{fallback}</AvatarFallback> : null}
    {children}
  </AvatarPrimitive>
));
AvatarInner.displayName = 'Avatar';

const AvatarImageInner = React.forwardRef<HTMLImageElement, AvatarImageProps>((props, ref) => <AvatarImage ref={ref} {...props} />);
AvatarImageInner.displayName = 'AvatarImage';

const AvatarFallbackInner = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>((props, ref) => <AvatarFallback ref={ref} {...props} />);
AvatarFallbackInner.displayName = 'AvatarFallback';

export const Avatar = React.memo(AvatarInner) as typeof AvatarInner;
export const OmniAvatarImage = React.memo(AvatarImageInner) as typeof AvatarImageInner;
export const OmniAvatarFallback = React.memo(AvatarFallbackInner) as typeof AvatarFallbackInner;
