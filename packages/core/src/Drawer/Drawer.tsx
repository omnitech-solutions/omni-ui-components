import * as React from 'react';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';
import type {
  DrawerCloseProps,
  DrawerContentProps,
  DrawerDescriptionProps,
  DrawerFooterProps,
  DrawerHeaderProps,
  DrawerOverlayProps,
  DrawerPortalProps,
  DrawerProps,
  DrawerTitleProps,
  DrawerTriggerProps,
} from './Drawer.types';

export const Drawer = Sheet as React.FC<DrawerProps>;
export const DrawerTrigger = SheetTrigger as React.FC<DrawerTriggerProps>;
export const DrawerPortal = SheetPortal as React.FC<DrawerPortalProps>;
export const DrawerClose = SheetClose as React.FC<DrawerCloseProps>;

const DrawerOverlayInner = React.forwardRef<HTMLDivElement, DrawerOverlayProps>((props, ref) => <SheetOverlay ref={ref} {...props} />);
DrawerOverlayInner.displayName = 'DrawerOverlay';

const DrawerContentInner = React.forwardRef<HTMLDivElement, DrawerContentProps>((props, ref) => <SheetContent ref={ref} {...props} />);
DrawerContentInner.displayName = 'DrawerContent';

const DrawerHeaderInner = (props: DrawerHeaderProps) => <SheetHeader {...props} />;
const DrawerFooterInner = (props: DrawerFooterProps) => <SheetFooter {...props} />;
DrawerHeaderInner.displayName = 'DrawerHeader';
DrawerFooterInner.displayName = 'DrawerFooter';

const DrawerTitleInner = React.forwardRef<HTMLHeadingElement, DrawerTitleProps>((props, ref) => <SheetTitle ref={ref} {...props} />);
DrawerTitleInner.displayName = 'DrawerTitle';

const DrawerDescriptionInner = React.forwardRef<HTMLParagraphElement, DrawerDescriptionProps>((props, ref) => <SheetDescription ref={ref} {...props} />);
DrawerDescriptionInner.displayName = 'DrawerDescription';

export const DrawerOverlay = React.memo(DrawerOverlayInner) as typeof DrawerOverlayInner;
export const DrawerContent = React.memo(DrawerContentInner) as typeof DrawerContentInner;
export const DrawerHeader = React.memo(DrawerHeaderInner);
export const DrawerFooter = React.memo(DrawerFooterInner);
export const DrawerTitle = React.memo(DrawerTitleInner) as typeof DrawerTitleInner;
export const DrawerDescription = React.memo(DrawerDescriptionInner) as typeof DrawerDescriptionInner;
