import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type * as React from 'react';

import { Table } from '../../src/Table';
import type { TableProps } from '../../src/Table/Table.types';
import { baseColumns, type Person, people } from './fixtures';

const renderTable = (props: Partial<TableProps<Person>> = {}) =>
  render(
    <Table<Person>
      columns={baseColumns}
      dataSource={people}
      rowKey="id"
      rowSelection={{}}
      {...props}
    />,
  );

// Selection keys are normalised to strings (TanStack row ids), whatever type rowKey produced.
const k = (...ids: number[]) => ids.map(String);

const checkbox = (id: number) =>
  screen.getByTestId(`table-selection-checkbox-${id}`) as HTMLInputElement;
const selectAll = () => screen.getByTestId('table-selection-checkbox-all') as HTMLInputElement;

describe('Table row selection', () => {
  it('adds a checkbox per row plus a select-all in the header', () => {
    renderTable();
    expect(screen.getAllByRole('checkbox')).toHaveLength(5);
    expect(screen.getByRole('checkbox', { name: 'Select row Ada' })).toBeInTheDocument();
    expect(selectAll()).toHaveAccessibleName('Select all rows');
  });

  it('selecting a row calls onChange and onSelect with keys, records and the row', () => {
    const onChange = vi.fn();
    const onSelect = vi.fn();
    renderTable({ rowSelection: { onChange, onSelect } });
    fireEvent.click(checkbox(2));
    expect(checkbox(2).checked).toBe(true);
    expect(onChange).toHaveBeenCalledWith(k(2), [people[1]], { type: 'single' });
    expect(onSelect).toHaveBeenCalledTimes(1);
    const [record, selected, selectedRows, , row] = onSelect.mock.calls[0];
    expect(record).toBe(people[1]);
    expect(selected).toBe(true);
    expect(selectedRows).toEqual([people[1]]);
    expect(row.key).toBe(2);
    expect(screen.getByTestId('table-body-row-2')).toHaveAttribute('data-selected', 'true');
  });

  it('unselecting reports the remaining selection', () => {
    const onChange = vi.fn();
    renderTable({ rowSelection: { onChange, defaultSelectedRowKeys: [1, 2] } });
    expect(checkbox(1).checked).toBe(true);
    fireEvent.click(checkbox(1));
    expect(onChange).toHaveBeenLastCalledWith(k(2), [people[1]], expect.anything());
    expect(checkbox(1).checked).toBe(false);
  });

  it('clicking the cell around the checkbox toggles the row', () => {
    renderTable();
    fireEvent.click(screen.getByTestId('table-selection-cell-3'));
    expect(checkbox(3).checked).toBe(true);
    fireEvent.click(screen.getByTestId('table-selection-cell-3'));
    expect(checkbox(3).checked).toBe(false);
  });

  it('select-all selects every row, reports onSelectAll, and a second click clears them', () => {
    const onChange = vi.fn();
    const onSelectAll = vi.fn();
    renderTable({ rowSelection: { onChange, onSelectAll } });
    fireEvent.click(selectAll());
    expect(people.every((p) => checkbox(p.id).checked)).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith(k(1, 2, 3, 4), people, { type: 'all' });
    expect(onSelectAll).toHaveBeenCalledWith(true, people, people);
    expect(selectAll().checked).toBe(true);
    fireEvent.click(selectAll());
    expect(people.some((p) => checkbox(p.id).checked)).toBe(false);
    expect(onSelectAll).toHaveBeenLastCalledWith(false, [], people);
  });

  it('marks the header checkbox mixed when only some rows are selected', () => {
    renderTable({ rowSelection: { defaultSelectedRowKeys: [1] } });
    // A native checkbox says "mixed" through `indeterminate`; `aria-checked` is not allowed on it.
    expect(selectAll().indeterminate).toBe(true);
    expect(selectAll()).not.toHaveAttribute('aria-checked');
    expect(selectAll().checked).toBe(false);
  });

  it('controlled selectedRowKeys drives the checkboxes and only changes when the parent says so', () => {
    const onChange = vi.fn();
    const { rerender } = renderTable({ rowSelection: { selectedRowKeys: [4], onChange } });
    expect(checkbox(4).checked).toBe(true);
    fireEvent.click(checkbox(1));
    expect(onChange).toHaveBeenCalledWith(k(4, 1), expect.anything(), expect.anything());
    expect(checkbox(1).checked).toBe(false);
    rerender(
      <Table<Person>
        columns={baseColumns}
        dataSource={people}
        rowKey="id"
        rowSelection={{ selectedRowKeys: [1, 4], onChange }}
      />,
    );
    expect(checkbox(1).checked).toBe(true);
  });

  it('getCheckboxProps can disable rows, which are skipped by select-all', () => {
    const onChange = vi.fn();
    renderTable({
      rowSelection: { onChange, getCheckboxProps: (record) => ({ disabled: record.id === 2 }) },
    });
    expect(checkbox(2)).toBeDisabled();
    expect(screen.getByTestId('table-body-row-2')).toHaveAttribute('data-disabled', 'true');
    fireEvent.click(screen.getByTestId('table-selection-cell-2'));
    expect(checkbox(2).checked).toBe(false);
    fireEvent.click(selectAll());
    expect(onChange).toHaveBeenLastCalledWith(k(1, 3, 4), [people[0], people[2], people[3]], {
      type: 'all',
    });
  });

  it('radio mode selects one row at a time and has no select-all', () => {
    const onChange = vi.fn();
    renderTable({ rowSelection: { type: 'radio', onChange } });
    expect(screen.queryByTestId('table-selection-checkbox-all')).not.toBeInTheDocument();
    expect(checkbox(1).type).toBe('radio');
    fireEvent.click(checkbox(1));
    fireEvent.click(checkbox(3));
    expect(onChange).toHaveBeenLastCalledWith(k(3), [people[2]], expect.anything());
    expect(checkbox(1).checked).toBe(false);
    expect(checkbox(3).checked).toBe(true);
    // clicking the cell of a radio row selects it without toggling it off
    fireEvent.click(screen.getByTestId('table-selection-cell-3'));
    expect(checkbox(3).checked).toBe(true);
  });

  it('shift-click selects the range between the last pick and this row', () => {
    const onChange = vi.fn();
    renderTable({ rowSelection: { onChange } });
    fireEvent.click(checkbox(1));
    fireEvent.click(checkbox(3), { shiftKey: true });
    expect(onChange).toHaveBeenLastCalledWith(k(1, 2, 3), people.slice(0, 3), expect.anything());
  });

  it('columnTitle, columnWidth, renderCell and onCell customise the selection column', () => {
    const onCell = vi.fn(() => ({ title: 'sel-cell' }));
    renderTable({
      rowSelection: {
        columnTitle: (origin) => <span>all: {origin}</span>,
        columnWidth: 60,
        renderCell: (checked, record, _i, origin) => (
          <span data-testid={`wrap-${record.id}`}>
            {checked ? 'on' : 'off'}
            {origin}
          </span>
        ),
        onCell,
      },
    });
    expect(screen.getByTestId('table-selection-header-cell')).toHaveTextContent('all:');
    expect(screen.getByTestId('table-selection-header-cell')).toHaveStyle({ width: '60px' });
    expect(screen.getByTestId('wrap-1')).toHaveTextContent('off');
    fireEvent.click(checkbox(1));
    expect(screen.getByTestId('wrap-1')).toHaveTextContent('on');
    expect(screen.getByTestId('table-selection-cell-1')).toHaveAttribute('title', 'sel-cell');
    expect(onCell).toHaveBeenCalledWith(people[0], 0, expect.objectContaining({ key: 1 }));
  });

  it('a string columnTitle replaces the select-all checkbox', () => {
    renderTable({ rowSelection: { columnTitle: 'Pick' } });
    expect(screen.getByTestId('table-selection-header-cell')).toHaveTextContent('Pick');
    expect(screen.queryByTestId('table-selection-checkbox-all')).not.toBeInTheDocument();
  });

  it('pins the selection column when fixed', () => {
    renderTable({ rowSelection: { fixed: true } });
    expect(screen.getByTestId('table-selection-header-cell')).toHaveAttribute(
      'data-pinned',
      'left',
    );
    expect(screen.getByTestId('table-selection-cell-1')).toHaveStyle({
      position: 'sticky',
      left: '0px',
    });
  });

  it('selection actions appear in a header menu and receive the changeable keys', () => {
    const onSelect = vi.fn();
    renderTable({ rowSelection: { selections: [{ key: 'evens', text: 'Even rows', onSelect }] } });
    expect(screen.queryByTestId('table-selection-menu')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open bulk actions' }));
    expect(screen.getByRole('button', { name: 'Open bulk actions' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    fireEvent.click(screen.getByTestId('table-selection-action-evens'));
    expect(onSelect).toHaveBeenCalledWith(k(1, 2, 3, 4));
    expect(screen.queryByTestId('table-selection-menu')).not.toBeInTheDocument();
  });

  it('the selection menu closes on Escape and on a pointerdown outside it', () => {
    renderTable({ rowSelection: { selections: [{ key: 'a', text: 'A', onSelect: vi.fn() }] } });
    const trigger = () => screen.getByRole('button', { name: 'Open bulk actions' });
    fireEvent.click(trigger());
    fireEvent.pointerDown(screen.getByTestId('table-selection-menu'));
    expect(screen.getByTestId('table-selection-menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('table-selection-menu')).not.toBeInTheDocument();
    fireEvent.click(trigger());
    fireEvent.pointerDown(document.body);
    expect(screen.queryByTestId('table-selection-menu')).not.toBeInTheDocument();
  });

  it('selections: true offers all, invert and none and reports each', () => {
    const onChange = vi.fn();
    const onSelectInvert = vi.fn();
    const onSelectNone = vi.fn();
    renderTable({
      rowSelection: {
        selections: true,
        onChange,
        onSelectInvert,
        onSelectNone,
        defaultSelectedRowKeys: [1],
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Open bulk actions' }));
    const menu = screen.getByTestId('table-selection-menu');
    const labels = within(menu)
      .getAllByRole('button')
      .map((b) => b.getAttribute('data-testid'));
    expect(labels).toHaveLength(3);
    const invert = within(menu)
      .getAllByRole('button')
      .find((b) => /invert/i.test(b.textContent ?? ''));
    expect(invert).toBeDefined();
    fireEvent.click(invert!);
    expect(onSelectInvert).toHaveBeenCalledWith(k(2, 3, 4));
    expect(people.map((p) => checkbox(p.id).checked)).toEqual([false, true, true, true]);
    fireEvent.click(screen.getByRole('button', { name: 'Open bulk actions' }));
    const none = within(screen.getByTestId('table-selection-menu'))
      .getAllByRole('button')
      .find((b) => /none|clear/i.test(b.textContent ?? ''));
    fireEvent.click(none!);
    expect(onSelectNone).toHaveBeenCalledTimes(1);
    expect(people.some((p) => checkbox(p.id).checked)).toBe(false);
  });

  it('preserveSelectedRowKeys keeps selected records that left the data (here: page change)', () => {
    const onChange = vi.fn();
    renderTable({
      pagination: { pageSize: 2, defaultCurrent: 1 },
      rowSelection: { onChange, preserveSelectedRowKeys: true },
    });
    fireEvent.click(checkbox(1));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(checkbox(3));
    expect(onChange).toHaveBeenLastCalledWith(k(1, 3), [people[0], people[2]], expect.anything());
  });
});

describe('Table bulk actions bar', () => {
  const bulk = (extra = {}) => ({
    bulkActions: { actions: [{ key: 'delete', label: 'Delete', onClick: vi.fn() }], ...extra },
  });

  it('stays hidden until something is selected, then shows the count', () => {
    renderTable({ rowSelection: bulk() });
    expect(screen.queryByTestId('table-bulk-bar')).not.toBeInTheDocument();
    fireEvent.click(checkbox(1));
    fireEvent.click(checkbox(2));
    expect(screen.getByTestId('table-bulk-count')).toHaveTextContent('2 selected');
  });

  it('runs a configured action with the selection and a clear callback', () => {
    const onClick = vi.fn();
    renderTable({
      rowSelection: bulk({
        actions: [{ key: 'delete', label: 'Delete', onClick, variant: 'danger' }],
      }),
    });
    fireEvent.click(checkbox(1));
    fireEvent.click(checkbox(4));
    fireEvent.click(screen.getByTestId('table-bulk-action-delete'));
    const ctx = onClick.mock.calls[0][0];
    expect(ctx.selectedRowKeys).toEqual(k(1, 4));
    expect(ctx.selectedRows).toEqual([people[0], people[3]]);
    expect(ctx.selectedDataRows.map((r: { key: unknown }) => r.key)).toEqual([1, 4]);
    ctx.clear();
  });

  it('Clear empties the selection and hides the bar', () => {
    const onChange = vi.fn();
    renderTable({ rowSelection: { ...bulk(), onChange } });
    fireEvent.click(checkbox(2));
    fireEvent.click(screen.getByTestId('table-bulk-clear'));
    expect(checkbox(2).checked).toBe(false);
    expect(screen.queryByTestId('table-bulk-bar')).not.toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith([], [], expect.anything());
  });

  it('disabled configured actions do not run', () => {
    const onClick = vi.fn();
    renderTable({
      rowSelection: bulk({
        actions: [{ key: 'archive', label: 'Archive', onClick, disabled: true }],
      }),
    });
    fireEvent.click(checkbox(1));
    expect(screen.getByTestId('table-bulk-action-archive')).toBeDisabled();
    fireEvent.click(screen.getByTestId('table-bulk-action-archive'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('showWhenEmpty and placement are honoured', () => {
    renderTable({ rowSelection: bulk({ showWhenEmpty: true, placement: 'right' }) });
    expect(screen.getByTestId('table-bulk-bar')).toHaveAttribute('data-placement', 'right');
    expect(screen.getByTestId('table-bulk-count')).toHaveTextContent('0 selected');
  });

  it('bulkActions.render takes over the bar when no actions are configured', () => {
    const render1 = vi.fn(
      ({
        selectedRowKeys,
        clear,
        Button,
      }: {
        selectedRowKeys: unknown[];
        clear: () => void;
        Button: React.FC<{ onClick?: () => void; children?: React.ReactNode }>;
      }) => <Button onClick={clear}>{`custom ${selectedRowKeys.length}`}</Button>,
    );
    renderTable({ rowSelection: { bulkActions: { render: render1 as never } } });
    fireEvent.click(checkbox(1));
    const btn = screen.getByRole('button', { name: 'custom 1' });
    expect(btn).toHaveClass('bui-table-bulk-btn');
    fireEvent.click(btn);
    expect(checkbox(1).checked).toBe(false);
  });

  it('without actions or render the bar falls back to the selection actions and Clear', () => {
    const onSelect = vi.fn();
    renderTable({
      rowSelection: { selections: [{ key: 'one', text: 'First two', onSelect }], bulkActions: {} },
    });
    fireEvent.click(checkbox(3));
    fireEvent.click(screen.getByTestId('table-bulk-action-one'));
    expect(onSelect).toHaveBeenCalledWith(k(1, 2, 3, 4));
    expect(screen.getByTestId('table-bulk-clear')).toBeInTheDocument();
  });
});
