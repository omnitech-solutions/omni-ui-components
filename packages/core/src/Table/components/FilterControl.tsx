import * as React from 'react';
import { AutoFlipDropdown } from '../Table.AutoFlipDropdown';
import { useTable } from '../hooks/useTable';
import { DefaultFilterIcon, filterItemMatchesSearch } from '../internal';
import type { TableColumn, TableFilterItem, TableKey } from '../Table.types';

export interface FilterControlProps<TRecord, TRowData> {
  column: TableColumn<TRecord, TRowData>;
  committedKeys: TableKey[];
  filtered: boolean;
  initialFilterItems: TableFilterItem[];
  onCommit: (column: TableColumn<TRecord, TRowData>, values: TableKey[]) => void;
}

export function FilterControl<TRecord, TRowData>({
  column: col,
  committedKeys,
  filtered,
  initialFilterItems,
  onCommit,
}: FilterControlProps<TRecord, TRowData>) {
  const { testIdPrefix, props: tableProps } = useTable<TRecord, TRowData>();
  const locale = tableProps.locale;
  const controlledOpen = col.filterDropdownProps?.open;
  const hasFilters = Boolean(col.filters?.length || col.filterDropdown);
  const icon = typeof col.filterIcon === 'function' ? col.filterIcon(filtered) : (col.filterIcon ?? <DefaultFilterIcon filtered={filtered} />);

  if (!hasFilters) {
    return (
      <span className="bui-table-filter-indicator" data-testid={`${testIdPrefix}-filter-icon-${col.key}`} data-filtered={filtered ? 'true' : 'false'}>
        {icon}
      </span>
    );
  }

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isOpen = controlledOpen ?? uncontrolledOpen;
  const [draftKeys, setDraftKeys] = React.useState<TableKey[]>(committedKeys);
  const [searchValue, setSearchValue] = React.useState('');
  const draftKeysRef = React.useRef(draftKeys);
  draftKeysRef.current = draftKeys;

  const setOpen = (nextOpen: boolean, commitOnClose = false) => {
    col.filterDropdownProps?.onOpenChange?.(nextOpen);
    if (controlledOpen === undefined) setUncontrolledOpen(nextOpen);
    if (nextOpen) {
      setDraftKeys(committedKeys);
    } else {
      setSearchValue('');
      if (commitOnClose) onCommit(col, draftKeysRef.current);
    }
  };

  const commitAndClose = (values: TableKey[]) => {
    onCommit(col, values);
    setOpen(false);
  };

  const toggleDraftValue = (value: TableKey) => {
    const multiple = col.filterMultiple !== false;
    const nextValues = multiple
      ? draftKeys.includes(value)
        ? draftKeys.filter((item) => item !== value)
        : [...draftKeys, value]
      : draftKeys.includes(value)
        ? []
        : [value];
    setDraftKeys(nextValues);
    if (col.filterOnChange) onCommit(col, nextValues);
  };

  React.useEffect(() => {
    if (!isOpen) return undefined;
    const closeActive = () => setOpen(false, col.filterOnClose !== false);
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(`[data-bui-table-filter-control="${col.key}"]`)) return;
      closeActive();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      closeActive();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, col.key, col.filterOnClose]);

  const dropdownProps = {
    column: col,
    selectedKeys: draftKeys,
    setSelectedKeys: (keys: TableKey[]) => {
      setDraftKeys(keys);
      if (col.filterOnChange) onCommit(col, keys);
    },
    confirm: () => commitAndClose(draftKeys),
    clearFilters: () => {
      const defaults = col.filterResetToDefaultFilteredValue ? (col.defaultFilteredValue ?? []) : [];
      setDraftKeys(defaults);
      commitAndClose(defaults);
    },
    close: () => setOpen(false),
  };

  const selfMatches = (filter: TableFilterItem) => filterItemMatchesSearch(filter, searchValue, col.filterSearch);
  const hasDescendantMatch = (filter: TableFilterItem): boolean => {
    if (selfMatches(filter)) return true;
    return Boolean(filter.children?.some(hasDescendantMatch));
  };

  const renderFilterItems = (items: TableFilterItem[], depth = 0): React.ReactNode =>
    items
      .filter((filter) => {
        if (filter.children?.length) {
          if (!searchValue) return true;
          return selfMatches(filter) || filter.children.some(hasDescendantMatch);
        }
        return selfMatches(filter);
      })
      .map((filter) => {
        const value = filter.value;
        const key = String(value);
        const groupLabelMatches = selfMatches(filter);
        const visibleChildren = filter.children?.filter(hasDescendantMatch);
        if (filter.children?.length) {
          return (
            <div key={key} className="bui-table-filter-group" data-testid={`${testIdPrefix}-filter-group-${col.key}-${key}`}>
              <div className="bui-table-filter-group-label" style={{ paddingLeft: depth * 12 }}>
                {filter.text}
              </div>
              <div>{renderFilterItems(searchValue && !groupLabelMatches ? (visibleChildren ?? []) : filter.children, depth + 1)}</div>
            </div>
          );
        }
        return (
          <label key={key} className="bui-table-filter-option" style={{ paddingLeft: depth * 12 }}>
            <input
              type={col.filterMultiple === false ? 'radio' : 'checkbox'}
              name={`${testIdPrefix}-filter-${col.key}`}
              checked={draftKeys.includes(value)}
              onChange={() => toggleDraftValue(value)}
              data-testid={`${testIdPrefix}-filter-option-${col.key}-${key}`}
            />
            <span>{filter.text}</span>
          </label>
        );
      });

  const dropdown = (
    <AutoFlipDropdown
      className="bui-table-filter-dropdown z-50 flex flex-col rounded border border-[var(--bui-table-border)] bg-[var(--bui-table-filter-dropdown-bg)] shadow-sm"
      data-testid={`${testIdPrefix}-filter-dropdown-${col.key}`}
      data-bui-table-filter-control={col.key}
    >
      {col.filterDropdown ? (
        typeof col.filterDropdown === 'function' ? (
          col.filterDropdown(dropdownProps)
        ) : (
          col.filterDropdown
        )
      ) : (
        <>
          {col.filterSearch && (
            <input
              aria-label={`Search ${typeof col.title === 'string' ? col.title : col.key} filters`}
              className="bui-table-filter-search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.currentTarget.value)}
              data-testid={`${testIdPrefix}-filter-search-${col.key}`}
            />
          )}
          <div className="bui-table-filter-options" data-filter-mode={col.filterMode ?? 'menu'}>
            {renderFilterItems(initialFilterItems)}
          </div>
          <div className="bui-table-filter-actions">
            <button
              type="button"
              className="bui-table-filter-action"
              onClick={() => {
                const defaults = col.filterResetToDefaultFilteredValue ? (col.defaultFilteredValue ?? []) : [];
                setDraftKeys(defaults);
                commitAndClose(defaults);
              }}
              data-testid={`${testIdPrefix}-filter-reset-${col.key}`}
            >
              {locale?.filterReset ?? 'Reset'}
            </button>
            <button
              type="button"
              className="bui-table-filter-action"
              onClick={() => commitAndClose(draftKeys)}
              data-testid={`${testIdPrefix}-filter-confirm-${col.key}`}
            >
              {locale?.filterConfirm ?? 'OK'}
            </button>
          </div>
        </>
      )}
    </AutoFlipDropdown>
  );

  return (
    <span className="relative inline-flex" data-bui-table-filter-control={col.key}>
      <button
        type="button"
        className="bui-table-filter-trigger"
        aria-label={`Filter ${typeof col.title === 'string' ? col.title : col.key}`}
        aria-expanded={isOpen}
        onClick={() => setOpen(!isOpen, isOpen && !col.filterDropdown && col.filterOnClose !== false)}
        data-testid={`${testIdPrefix}-filter-trigger-${col.key}`}
        data-filtered={filtered ? 'true' : 'false'}
      >
        {icon}
      </button>
      {isOpen && dropdown}
    </span>
  );
}
