import * as React from 'react';

export interface AvatarProps extends React.ComponentPropsWithoutRef<'span'> {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
}

export type AvatarImageProps = React.ComponentPropsWithoutRef<'img'>;
export interface AvatarFallbackProps extends React.ComponentPropsWithoutRef<'span'> {}
