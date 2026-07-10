import * as React from 'react';
import classNames from 'classnames';
import { Button } from '../../../Button';
import type { TableBulkActionsButtonProps } from '../../Table.types';

const variantMap = {
  primary: 'default',
  secondary: 'secondary',
  default: 'default',
  ghost: 'ghost',
  outline: 'outline',
  'outline-primary': 'outline',
  'outline-secondary': 'outline',
  danger: 'destructive',
  'outline-danger': 'outline',
} as const;

const sizeMap = {
  xs: 'sm',
  sm: 'sm',
  smd: 'default',
  md: 'md',
  lg: 'lg',
} as const;

// Bulk-bar button: Bonsai Button + shared `bui-table-bulk-btn` class so
// `bulkActions.render` overrides compose cleanly.
export const BulkActionsButton: React.FC<TableBulkActionsButtonProps> = ({ variant = 'secondary', size = 'sm', children, className, ...rest }) => (
  <Button variant={variantMap[variant]} buttonSize={sizeMap[size]} className={classNames('bui-table-bulk-btn', className)} {...rest}>
    {children}
  </Button>
);
BulkActionsButton.displayName = 'TableBulkActionsButton';
