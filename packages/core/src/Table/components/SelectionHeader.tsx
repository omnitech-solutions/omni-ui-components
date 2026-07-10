import * as React from 'react';
import classNames from 'classnames';
import { ChevronDown } from 'lucide-react';
import { useTable } from '../hooks/useTable';
import { headerCellClass } from '../internal';
import type { TableProps, TableSelectionAction } from '../Table.types';

export interface SelectionHeaderProps<TRecord, TRowData> {
  rowSelection: NonNullable<TableProps<TRecord, TRowData>['rowSelection']>;
  actions: TableSelectionAction[];
  allChangeableSelected: boolean;
  someChangeableSelected: boolean;
  hasChangeableKeys: boolean;
  titleCheckboxProps: React.InputHTMLAttributes<HTMLInputElement>;
  onSelectAll: (nextChecked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  onRunAction: (action: TableSelectionAction) => void;
  fixedSide: 'left' | 'right' | undefined;
  alignStyle: React.CSSProperties;
  className?: string;
}

export function SelectionHeader<TRecord, TRowData>({
  rowSelection,
  actions,
  allChangeableSelected,
  someChangeableSelected,
  hasChangeableKeys,
  titleCheckboxProps,
  onSelectAll,
  onRunAction,
  fixedSide,
  alignStyle,
  className,
}: SelectionHeaderProps<TRecord, TRowData>) {
  const { testIdPrefix } = useTable<TRecord, TRowData>();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const style: React.CSSProperties = {
    width: rowSelection.columnWidth ?? 'var(--bui-table-selection-column-width)',
    ...alignStyle,
    ...(fixedSide ? { position: 'sticky', [fixedSide]: 0 } : {}),
  };

  const originNode =
    rowSelection.type === 'radio' ? null : (
      <input
        type="checkbox"
        aria-label="Select all rows"
        {...titleCheckboxProps}
        checked={allChangeableSelected}
        aria-checked={someChangeableSelected ? 'mixed' : allChangeableSelected}
        disabled={!hasChangeableKeys || titleCheckboxProps.disabled}
        onChange={(event) => {
          titleCheckboxProps.onChange?.(event);
          onSelectAll(event.currentTarget.checked, event);
        }}
        data-testid={`${testIdPrefix}-selection-checkbox-all`}
      />
    );

  const titleContent = rowSelection.columnTitle
    ? typeof rowSelection.columnTitle === 'function'
      ? rowSelection.columnTitle(originNode)
      : rowSelection.columnTitle
    : originNode;

  // Close menu when a document click lands outside the menu region.
  React.useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-bui-table-selection-control="menu"]')) return;
      setMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <th
      className={classNames(headerCellClass, fixedSide && 'sticky z-[2]', className)}
      style={style}
      data-testid={`${testIdPrefix}-selection-header-cell`}
      data-pinned={fixedSide}
    >
      <span className="bui-table-selection-header" data-bui-table-selection-control="menu">
        <span className="bui-table-selection-header__title">{titleContent}</span>
        {actions.length > 0 && (
          <span className="bui-table-selection-menu">
            <button
              type="button"
              className="bui-table-selection-menu-trigger"
              aria-label="Open bulk actions"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((current) => !current)}
              data-testid={`${testIdPrefix}-selection-menu-trigger`}
            >
              <span className="bui-table-selection-menu-trigger__label">Bulk</span>
              <ChevronDown className="bui-table-icon" aria-hidden="true" />
            </button>
            {menuOpen && (
              <span className="bui-table-selection-menu-dropdown" data-testid={`${testIdPrefix}-selection-menu`}>
                {actions.map((selection) => (
                  <button
                    key={selection.key}
                    type="button"
                    className="bui-table-selection-menu-action"
                    onClick={() => {
                      onRunAction(selection);
                      setMenuOpen(false);
                    }}
                    data-testid={`${testIdPrefix}-selection-action-${selection.key}`}
                  >
                    {selection.text}
                  </button>
                ))}
              </span>
            )}
          </span>
        )}
      </span>
    </th>
  );
}
