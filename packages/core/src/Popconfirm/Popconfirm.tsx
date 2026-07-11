import * as React from 'react';

import { Button } from '../Button';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';

export interface PopconfirmProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: React.ReactNode;
  cancelText?: React.ReactNode;
  children: React.ReactNode;
}

export const Popconfirm = ({ title, description, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', children }: PopconfirmProps) => (
  <Popover>
    <PopoverTrigger asChild>{children}</PopoverTrigger>
    <PopoverContent className="w-80 space-y-3">
      <div className="space-y-1">
        <div className="text-sm font-semibold">{title}</div>
        {description ? <div className="text-sm text-muted-foreground">{description}</div> : null}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" buttonSize="sm" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button buttonSize="sm" onClick={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </PopoverContent>
  </Popover>
);
