import * as React from 'react';
import type * as DialogPrimitive from '@radix-ui/react-dialog';

export type DrawerProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>;
export type DrawerTriggerProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>;
export type DrawerPortalProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>;
export type DrawerCloseProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>;
export type DrawerOverlayProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>;
export interface DrawerContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: 'top' | 'bottom' | 'left' | 'right';
}
export interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export type DrawerTitleProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>;
export type DrawerDescriptionProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>;
