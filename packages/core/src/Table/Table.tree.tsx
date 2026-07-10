/**
 * Tree-table concerns.
 *
 * Owns the two decisions the rest of Table.tsx needs to make when the
 * caller passes nested `children` on their records:
 *
 * - `detectTreeMode` — should the Table render as a tree at all?
 * - `TreeExpandToggle` — the inline chevron + indent that lives inside
 *   the first data cell (instead of a separate expand column).
 *
 * The Table auto-detects tree data via `childrenColumnName` (default
 * `'children'`) and can be opted out by passing `expandedRowRender`
 * (row-expansion mode) or `showExpandColumn: true` (keep a dedicated
 * expand column). Indent width comes from `expandable.indentSize`.
 */

import * as React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

import type { TableExpandable } from './Table.types';

const DEFAULT_INDENT_SIZE = 24;

export const detectTreeMode = <TRecord,>(
  dataSource: readonly TRecord[] | undefined,
  childrenColumnName: string,
  expandable: TableExpandable<TRecord, unknown> | undefined,
): boolean => {
  if (expandable?.expandedRowRender) return false;
  if (expandable?.showExpandColumn === true) return false;
  return (dataSource ?? []).some((record) => Array.isArray((record as Record<string, unknown>)[childrenColumnName]));
};

interface TreeExpandToggleProps {
  indent: number;
  indentSize?: number;
  canExpand: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  rowKey: string;
  testId?: string;
  /** Optional caller-supplied icon renderer. Receives `{ expanded, onToggle }`
   * and returns any ReactNode (icon, glyph, custom button). When omitted the
   * default lucide chevron button is used. */
  renderIcon?: (ctx: { expanded: boolean; canExpand: boolean; onToggle: (event: React.MouseEvent) => void }) => React.ReactNode;
}

export const TreeExpandToggle: React.FC<TreeExpandToggleProps> = ({
  indent,
  indentSize = DEFAULT_INDENT_SIZE,
  canExpand,
  isExpanded,
  onToggle,
  rowKey,
  testId,
  renderIcon,
}) => {
  const spacer = <span aria-hidden="true" style={{ display: 'inline-block', width: 20, height: 20 }} />;
  const handleToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    onToggle();
  };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        paddingLeft: indent * indentSize,
        verticalAlign: 'middle',
      }}
    >
      {!canExpand ? (
        spacer
      ) : renderIcon ? (
        renderIcon({ expanded: isExpanded, canExpand, onToggle: handleToggle })
      ) : (
        <button
          type="button"
          className="bui-table-expand-toggle"
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} row ${rowKey}`}
          onClick={handleToggle}
          data-testid={testId}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            padding: 0,
            border: 0,
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
          }}
        >
          {isExpanded ? (
            <ChevronDown className="bui-table-expand-toggle__icon" aria-hidden="true" style={{ width: 14, height: 14 }} />
          ) : (
            <ChevronRight className="bui-table-expand-toggle__icon" aria-hidden="true" style={{ width: 14, height: 14 }} />
          )}
        </button>
      )}
    </span>
  );
};
