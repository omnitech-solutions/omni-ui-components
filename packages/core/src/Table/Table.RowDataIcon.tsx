/**
 * Named icons that Table columns can render declaratively via
 * `column.type = 'icon'` + `column.icon = '<name>'`. Aliases are folded
 * so both `checkmark` / `check` resolve to the same lucide component.
 */

import * as React from 'react';
import { Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Circle, File, Folder, FolderOpen, type LucideIcon } from 'lucide-react';

import type { RowDataType } from './Table.RowData';

export type RowDataIconName =
  | 'check'
  | 'checkmark'
  | 'check-circle'
  | 'chevron'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'circle'
  | 'file'
  | 'folder'
  | 'folder-open';

const ICONS: Record<RowDataIconName, LucideIcon> = {
  check: Check,
  checkmark: Check,
  'check-circle': CheckCircle2,
  chevron: ChevronRight,
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-left': ChevronLeft,
  circle: Circle,
  file: File,
  folder: Folder,
  'folder-open': FolderOpen,
};

export const RowDataIcon: React.FC<{ name: RowDataIconName; size?: number; className?: string }> = ({ name, size = 16, className }) => {
  const Component = ICONS[name];
  if (!Component) return null;
  return <Component size={size} className={className} aria-hidden />;
};

/** Row-data type descriptor for `column.type = 'icon'`. Prefers
 * `column.icon`, falling back to the cell value if it names a known icon. */
export const RowDataIconType: RowDataType = {
  type: 'icon',
  render: ({ column, value }) => {
    const name = ((column as { icon?: string }).icon ?? (typeof value === 'string' ? value : undefined)) as RowDataIconName | undefined;
    if (!name) return null;
    return <RowDataIcon name={name} />;
  },
};
