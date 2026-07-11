import * as React from 'react';
import type * as DialogPrimitive from '@radix-ui/react-dialog';

export type ModalProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>;
export type ModalTriggerProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>;
export type ModalPortalProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>;
export type ModalCloseProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>;
export type ModalOverlayProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>;
export type ModalContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>;
export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export type ModalTitleProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>;
export type ModalDescriptionProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>;
