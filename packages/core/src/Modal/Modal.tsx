import * as React from 'react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import type {
  ModalCloseProps,
  ModalContentProps,
  ModalDescriptionProps,
  ModalFooterProps,
  ModalHeaderProps,
  ModalOverlayProps,
  ModalPortalProps,
  ModalProps,
  ModalTitleProps,
  ModalTriggerProps,
} from './Modal.types';

export const Modal = Dialog as React.FC<ModalProps>;
export const ModalTrigger = DialogTrigger as React.FC<ModalTriggerProps>;
export const ModalPortal = DialogPortal as React.FC<ModalPortalProps>;
export const ModalClose = DialogClose as React.FC<ModalCloseProps>;

const ModalOverlayInner = React.forwardRef<HTMLDivElement, ModalOverlayProps>((props, ref) => <DialogOverlay ref={ref} {...props} />);
ModalOverlayInner.displayName = 'ModalOverlay';

const ModalContentInner = React.forwardRef<HTMLDivElement, ModalContentProps>((props, ref) => <DialogContent ref={ref} {...props} />);
ModalContentInner.displayName = 'ModalContent';

const ModalHeaderInner = (props: ModalHeaderProps) => <DialogHeader {...props} />;
const ModalFooterInner = (props: ModalFooterProps) => <DialogFooter {...props} />;
ModalHeaderInner.displayName = 'ModalHeader';
ModalFooterInner.displayName = 'ModalFooter';

const ModalTitleInner = React.forwardRef<HTMLHeadingElement, ModalTitleProps>((props, ref) => <DialogTitle ref={ref} {...props} />);
ModalTitleInner.displayName = 'ModalTitle';

const ModalDescriptionInner = React.forwardRef<HTMLParagraphElement, ModalDescriptionProps>((props, ref) => <DialogDescription ref={ref} {...props} />);
ModalDescriptionInner.displayName = 'ModalDescription';

export const ModalOverlay = React.memo(ModalOverlayInner) as typeof ModalOverlayInner;
export const ModalContent = React.memo(ModalContentInner) as typeof ModalContentInner;
export const ModalHeader = React.memo(ModalHeaderInner);
export const ModalFooter = React.memo(ModalFooterInner);
export const ModalTitle = React.memo(ModalTitleInner) as typeof ModalTitleInner;
export const ModalDescription = React.memo(ModalDescriptionInner) as typeof ModalDescriptionInner;
