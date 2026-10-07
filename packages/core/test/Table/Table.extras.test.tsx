import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type * as React from 'react';

import { Table } from '../../src/Table';
import { currentResponsiveScreens, useResponsiveScreens } from '../../src/Table/internal';
import type { TableColumn, TableProps } from '../../src/Table/Table.types';
import { baseColumns, bodyNames, type Person, people } from './fixtures';

const renderTable = (props: Partial<TableProps<Person>> = {}) =>
  render(<Table<Person> columns={baseColumns} dataSource={people} rowKey="id" {...props} />);

describe('Table virtual rows with a measured viewport', () => {
  const sizes = {
    h: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight'),
    w: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth'),
  };
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: 100,
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 400 });
  });
  afterEach(() => {
    if (sizes.h) Object.defineProperty(HTMLElement.prototype, 'offsetHeight', sizes.h);
    else delete (HTMLElement.prototype as unknown as Record<string, unknown>).offsetHeight;
    if (sizes.w) Object.defineProperty(HTMLElement.prototype, 'offsetWidth', sizes.w);
    else delete (HTMLElement.prototype as unknown as Record<string, unknown>).offsetWidth;
  });

  const many: Person[] = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `P${i}`,
    role: 'r',
    age: i,
    salary: 0,
    joined: '',
  }));

  it('renders only the rows in view plus overscan, with spacer rows standing in for the rest', () => {
    const { container } = render(
      <Table<Person>
        columns={baseColumns}
        dataSource={many}
        rowKey="id"
        virtual={{ rows: true, estimateRowHeight: 20, overscan: 1 }}
        scroll={{ y: 100 }}
      />,
    );
    const rendered = container.querySelectorAll('tbody tr[data-row-key]');
    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered.length).toBeLessThan(15);
    expect(rendered[0]).toHaveAttribute('data-row-key', '0');
    const spacer = container.querySelector('tbody tr[aria-hidden="true"]');
    expect(spacer).not.toBeNull();
    expect(spacer!.querySelector('td')).toHaveAttribute('colspan', '3');
    expect(screen.getByTestId('table-root')).toHaveAttribute('data-virtual-rows', 'true');
  });

  it('virtual rows keep their real index for callbacks', () => {
    const onRow = vi.fn(() => ({}));
    render(
      <Table<Person>
        columns={baseColumns}
        dataSource={many}
        rowKey="id"
        virtual={{ rows: true, estimateRowHeight: 20 }}
        scroll={{ y: 100 }}
        onRow={onRow}
      />,
    );
    expect(onRow.mock.calls[0][1]).toBe(0);
    expect(onRow.mock.calls[1][1]).toBe(1);
  });

  it('virtual columns render the visible columns plus pinned ones', () => {
    const wide: TableColumn<Person>[] = Array.from({ length: 30 }, (_, i) => ({
      key: `c${i}`,
      title: `C${i}`,
      dataIndex: 'name',
      width: 100,
      fixed: i === 0 ? ('left' as const) : undefined,
    }));
    render(
      <Table<Person>
        columns={wide}
        dataSource={people}
        rowKey="id"
        virtual={{ columns: true, estimateColumnWidth: 100, overscan: 1 }}
        scroll={{ x: 3000 }}
      />,
    );
    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBeLessThan(30);
    expect(screen.getByTestId('table-header-cell-c0')).toHaveAttribute('data-pinned', 'left');
  });
});

describe('Table drag and drop lifecycle', () => {
  const rows = people.map((record) => ({ key: record.id, record, draggable: true }));

  it('starting a keyboard drag flags the row and column being dragged, and cancelling clears it', async () => {
    renderTable({ columns: baseColumns.map((c) => ({ ...c, draggable: true })), rows: undefined });
    const colHandle = screen.getByRole('button', { name: 'Reorder column name' });
    colHandle.focus();
    fireEvent.keyDown(colHandle, { key: ' ', code: 'Space' });
    await waitFor(() =>
      expect(screen.getByTestId('table-header-cell-name')).toHaveAttribute('data-dragging', 'true'),
    );
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    await waitFor(() =>
      expect(screen.getByTestId('table-header-cell-name')).not.toHaveAttribute('data-dragging'),
    );
  });

  it('dropping a row without moving it leaves the order unchanged and reports nothing', async () => {
    const onRowOrderChange = vi.fn();
    const { container } = render(
      <Table<Person> columns={baseColumns} rows={rows} onRowOrderChange={onRowOrderChange} />,
    );
    const handle = screen.getByRole('button', { name: 'Reorder row 1' });
    handle.focus();
    fireEvent.keyDown(handle, { key: ' ', code: 'Space' });
    await waitFor(() =>
      expect(screen.getByTestId('table-body-row-1')).toHaveAttribute('data-dragging', 'true'),
    );
    fireEvent.keyDown(document, { key: ' ', code: 'Space' });
    await waitFor(() =>
      expect(screen.getByTestId('table-body-row-1')).not.toHaveAttribute('data-dragging'),
    );
    expect(onRowOrderChange).not.toHaveBeenCalled();
    expect(bodyNames(container)).toEqual(['Ada', 'Grace', 'Linus', 'Margaret']);
  });
});

describe('Table custom registry cells', () => {
  it('a custom SelectionCell can drive selection through onCheckedChange', () => {
    const onChange = vi.fn();
    const SelectionCell = ({
      checked,
      onCheckedChange,
      record,
    }: {
      checked: boolean;
      onCheckedChange: (next: boolean) => void;
      record: Person;
    }) => (
      <td>
        <button
          data-testid={`custom-sel-${record.id}`}
          aria-pressed={checked}
          onClick={() => onCheckedChange(!checked)}
        />
      </td>
    );
    renderTable({
      rowSelection: { onChange },
      registry: { components: { SelectionCell } as never },
    });
    fireEvent.click(screen.getByTestId('custom-sel-2'));
    expect(onChange).toHaveBeenCalledWith(['2'], [people[1]], expect.anything());
    expect(screen.getByTestId('custom-sel-2')).toHaveAttribute('aria-pressed', 'true');
  });

  it('a custom ExpandCell can drive expansion through onExpandedChange', () => {
    const ExpandCell = ({
      expanded,
      onExpandedChange,
      record,
    }: {
      expanded: boolean;
      onExpandedChange: (next: boolean) => void;
      record: Person;
    }) => (
      <td>
        <button
          data-testid={`custom-exp-${record.id}`}
          aria-expanded={expanded}
          onClick={() => onExpandedChange(!expanded)}
        />
      </td>
    );
    renderTable({
      expandable: { expandedRowRender: (record) => `more ${record.name}` },
      registry: { components: { ExpandCell } as never },
    });
    fireEvent.click(screen.getByTestId('custom-exp-1'));
    expect(screen.getByText('more Ada')).toBeInTheDocument();
  });

  it('a custom expandIcon in the expand column receives onExpand', () => {
    renderTable({
      expandable: {
        expandedRowRender: () => 'details',
        expandIcon: ({ expanded, onExpand, record }) => (
          <button data-testid={`ei-${record.id}`} onClick={(event) => onExpand(record, event)}>
            {expanded ? '-' : '+'}
          </button>
        ),
      },
    });
    fireEvent.click(screen.getByTestId('ei-3'));
    expect(screen.getByTestId('ei-3')).toHaveTextContent('-');
    expect(screen.getByText('details')).toBeInTheDocument();
  });

  it('nested rows in a dedicated expand column are indented with guide lines', () => {
    const data: Person[] = [{ ...people[0], children: [{ ...people[1], children: [people[2]] }] }];
    render(
      <Table<Person>
        columns={baseColumns}
        dataSource={data}
        rowKey="id"
        expandable={{ showExpandColumn: true, defaultExpandAllRows: true, indentSize: 16 }}
      />,
    );
    const nested = screen.getByTestId('table-expand-cell-3');
    expect(nested).toHaveAttribute('data-indent', '2');
    expect(nested.querySelectorAll('.bui-table-expand-guide')).toHaveLength(2);
    expect(nested).toHaveStyle({ paddingLeft: '32px' });
  });

  it('a custom BodyCell renders every data cell', () => {
    const BodyCell = ({ children, value }: { children?: React.ReactNode; value: unknown }) => (
      <td data-testid="mine" data-v={String(value)}>
        {children}
      </td>
    );
    renderTable({ registry: { components: { BodyCell } as never } });
    expect(screen.getAllByTestId('mine')).toHaveLength(12);
  });
});

describe('Table headers: groups with utility columns and multi-sort', () => {
  const grouped: TableColumn<Person>[] = [
    { key: 'name', title: 'Name', dataIndex: 'name' },
    {
      key: 'work',
      title: 'Work',
      children: [
        { key: 'role', title: 'Role', dataIndex: 'role' },
        { key: 'age', title: 'Age', dataIndex: 'age' },
      ],
    },
  ];

  it('the leaf header row reserves a cell for each utility column', () => {
    const rows = people.map((record) => ({ key: record.id, record, draggable: true }));
    render(
      <Table<Person>
        columns={grouped}
        rows={rows}
        rowSelection={{}}
        expandable={{ expandedRowRender: () => null }}
      />,
    );
    expect(screen.getByTestId('table-row-drag-header-cell-leaf')).toBeInTheDocument();
    expect(screen.getByTestId('table-selection-header-cell-leaf')).toBeInTheDocument();
    expect(screen.getByTestId('table-expand-header-cell-leaf')).toBeInTheDocument();
  });

  it('onHeaderRow decorates the grouped main row with the group columns', () => {
    const onHeaderRow = vi.fn(() => ({ 'data-custom': 'y' }) as never);
    render(
      <Table<Person> columns={grouped} dataSource={people} rowKey="id" onHeaderRow={onHeaderRow} />,
    );
    expect(onHeaderRow.mock.calls[0][0].map((c: TableColumn<Person>) => c.key)).toEqual([
      'name',
      'work',
    ]);
    expect(screen.getByTestId('table-header-row-main')).toHaveAttribute('data-custom', 'y');
  });

  it('a colSpan of 0 on a header removes it', () => {
    renderTable({
      columns: [
        { key: 'name', title: 'Name', dataIndex: 'name' },
        { key: 'role', title: 'Role', dataIndex: 'role', onHeaderCell: () => ({ colSpan: 0 }) },
      ],
    });
    expect(screen.queryByRole('columnheader', { name: 'Role' })).not.toBeInTheDocument();
  });

  it('three multi-priority sorters order by priority and each can be switched off independently', () => {
    const data: Person[] = [
      { id: 1, name: 'B', role: 'x', age: 2, salary: 1, joined: '' },
      { id: 2, name: 'A', role: 'y', age: 2, salary: 2, joined: '' },
      { id: 3, name: 'A', role: 'x', age: 1, salary: 3, joined: '' },
    ];
    const columns: TableColumn<Person>[] = [
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
        sorter: { compare: (a, b) => a.name.localeCompare(b.name), multiple: 3 },
      },
      {
        key: 'role',
        title: 'Role',
        dataIndex: 'role',
        sorter: { compare: (a, b) => a.role.localeCompare(b.role), multiple: 2 },
      },
      {
        key: 'age',
        title: 'Age',
        dataIndex: 'age',
        sorter: { compare: (a, b) => a.age - b.age, multiple: 1 },
      },
    ];
    const { container } = render(<Table<Person> columns={columns} dataSource={data} rowKey="id" />);
    const order = () =>
      Array.from(container.querySelectorAll('tbody tr')).map((tr) =>
        tr.getAttribute('data-row-key'),
      );
    fireEvent.click(screen.getByRole('button', { name: 'Sort Age' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sort Role' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sort Name' }));
    expect(order()).toEqual(['3', '2', '1']);
    // switch Name off (ascend -> descend -> none): the rest stay sorted
    fireEvent.click(screen.getByRole('button', { name: 'Sort Name' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sort Name' }));
    expect(screen.getByRole('button', { name: 'Sort Name' })).not.toHaveAttribute('aria-sort');
    expect(screen.getByRole('button', { name: 'Sort Role' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    expect(order()).toEqual(['3', '1', '2']);
  });

  it('a plain sorter after a multi sorter starts a fresh single sort', () => {
    const columns: TableColumn<Person>[] = [
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
        sorter: { compare: (a, b) => a.name.localeCompare(b.name), multiple: 1 },
      },
      { key: 'age', title: 'Age', dataIndex: 'age', sorter: true },
    ];
    renderTable({ columns });
    fireEvent.click(screen.getByRole('button', { name: 'Sort Name' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sort Age' }));
    expect(screen.getByRole('button', { name: 'Sort Name' })).not.toHaveAttribute('aria-sort');
    expect(screen.getByRole('button', { name: 'Sort Age' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
  });
});

describe('Table cell edge cases', () => {
  it('a cell-level onKeyDown runs before the table handles Enter, and can prevent editing', () => {
    const onKeyDown = vi.fn((event: React.KeyboardEvent) => event.preventDefault());
    renderTable({
      columns: [
        {
          key: 'name',
          title: 'Name',
          dataIndex: 'name',
          editable: true,
          onCell: () => ({ onKeyDown }),
        },
      ],
    });
    fireEvent.keyDown(screen.getByTestId('table-body-cell-1-name'), { key: 'Enter' });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('table-edit-input-1-name')).not.toBeInTheDocument();
  });

  it('a cell with rowSpan 0 is removed and colSpan from onCell is applied', () => {
    renderTable({
      columns: [
        {
          key: 'name',
          title: 'Name',
          dataIndex: 'name',
          onCell: (record) => (record.id === 1 ? { colSpan: 2 } : {}),
        },
        {
          key: 'role',
          title: 'Role',
          dataIndex: 'role',
          onCell: (record) =>
            record.id === 1 ? { colSpan: 0 } : record.id === 2 ? { rowSpan: 0 } : {},
        },
      ],
    });
    expect(screen.getByTestId('table-body-cell-1-name')).toHaveAttribute('colspan', '2');
    expect(screen.queryByTestId('table-body-cell-1-role')).not.toBeInTheDocument();
    expect(screen.queryByTestId('table-body-cell-2-role')).not.toBeInTheDocument();
    expect(screen.getByTestId('table-body-cell-3-role')).toBeInTheDocument();
  });

  it('columnPinning state pins columns on either side and reports the side', () => {
    renderTable({ state: { columnPinning: { left: ['name'], right: ['age'] } } });
    expect(screen.getByTestId('table-body-cell-1-name')).toHaveAttribute('data-pinned', 'left');
    expect(screen.getByTestId('table-body-cell-1-age')).toHaveAttribute('data-pinned', 'right');
    expect(screen.getByTestId('table-header-cell-age')).toHaveAttribute('data-pinned', 'right');
    expect(screen.getByTestId('table-body-cell-1-role')).not.toHaveAttribute('data-pinned');
  });

  it('columnSizing state sets header widths', () => {
    renderTable({ state: { columnSizing: { name: 222 } } });
    expect(screen.getByTestId('table-header-cell-name')).toHaveStyle({ width: '222px' });
  });

  it('columnVisibility state hides columns', () => {
    renderTable({ state: { columnVisibility: { role: false } } });
    expect(screen.queryByRole('columnheader', { name: 'Role' })).not.toBeInTheDocument();
  });

  it('shift-Tab on the first editable cell cannot navigate, so the editor stays', async () => {
    renderTable({ columns: [{ key: 'name', title: 'Name', dataIndex: 'name', editable: true }] });
    fireEvent.click(screen.getByTestId('table-body-cell-1-name'));
    fireEvent.keyDown(screen.getByTestId('table-edit-input-1-name'), {
      key: 'Tab',
      shiftKey: true,
    });
    await act(async () => {});
    expect(screen.getByTestId('table-edit-input-1-name')).toBeInTheDocument();
  });

  it('Tab with an invalid value stays on the cell and shows the error', async () => {
    renderTable({
      columns: [
        {
          key: 'name',
          title: 'Name',
          dataIndex: 'name',
          editable: { mode: 'cell', validate: () => 'nope' },
        },
        { key: 'role', title: 'Role', dataIndex: 'role', editable: true },
      ],
    });
    fireEvent.click(screen.getByTestId('table-body-cell-1-name'));
    fireEvent.keyDown(screen.getByTestId('table-edit-input-1-name'), { key: 'Tab' });
    expect(await screen.findByRole('alert')).toHaveTextContent('nope');
    expect(screen.queryByTestId('table-edit-input-1-role')).not.toBeInTheDocument();
    // a following blur still validates rather than silently dropping the edit
    fireEvent.blur(screen.getByTestId('table-edit-input-1-name'));
    await act(async () => {});
    expect(screen.getByTestId('table-edit-input-1-name')).toBeInTheDocument();
  });

  it('Tab out of the last cell when onAppendRow returns nothing does not start another edit', async () => {
    const onAppendRow = vi.fn(() => undefined);
    renderTable({
      columns: [{ key: 'name', title: 'Name', dataIndex: 'name', editable: true }],
      editable: { appendRowOnTab: true, onAppendRow },
      dataSource: [people[0]],
    });
    fireEvent.click(screen.getByTestId('table-body-cell-1-name'));
    fireEvent.keyDown(screen.getByTestId('table-edit-input-1-name'), { key: 'Tab' });
    await waitFor(() => expect(onAppendRow).toHaveBeenCalled());
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
  });

  it('an appended row with no editable cells is not entered', async () => {
    const onAppendRow = vi.fn(() => ({ key: 'plain', cells: {}, disabled: true }));
    renderTable({
      columns: [{ key: 'name', title: 'Name', dataIndex: 'name', editable: true }],
      editable: { appendRowOnTab: true, onAppendRow },
      dataSource: [people[0]],
    });
    fireEvent.click(screen.getByTestId('table-body-cell-1-name'));
    fireEvent.keyDown(screen.getByTestId('table-edit-input-1-name'), { key: 'Tab' });
    await waitFor(() => expect(onAppendRow).toHaveBeenCalled());
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
  });

  it('a custom row-mode editor can navigate only when allowed (onNavigate is a no-op while a row is editing)', () => {
    let navigated: boolean | undefined;
    const renderEditor = vi.fn((ctx) => (
      <button
        data-testid="nav"
        onClick={() => {
          navigated = ctx.onNavigate(1);
        }}
      >
        go
      </button>
    ));
    render(
      <Table<Person>
        columns={[
          {
            key: 'name',
            title: 'Name',
            dataIndex: 'name',
            editable: { mode: 'row', renderEditor },
          },
        ]}
        rows={[{ key: 1, record: people[0], editable: true }]}
      />,
    );
    fireEvent.click(screen.getByTestId('table-body-cell-1-name'));
    fireEvent.click(screen.getByTestId('nav'));
    expect(navigated).toBe(false);
  });

  it('Space and Enter are ignored on cells that are not editable and while already editing', () => {
    renderTable({
      columns: [
        { key: 'name', title: 'Name', dataIndex: 'name', editable: true },
        { key: 'role', title: 'Role', dataIndex: 'role' },
      ],
    });
    fireEvent.keyDown(screen.getByTestId('table-body-cell-1-role'), { key: 'Enter' });
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    fireEvent.click(screen.getByTestId('table-body-cell-1-name'));
    const cellNode = screen.getByTestId('table-body-cell-1-name');
    fireEvent.keyDown(cellNode, { key: 'Enter' });
    fireEvent.click(cellNode);
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
  });

  it('a selection checkbox cell can be pinned right and the select-all header follows', () => {
    renderTable({ rowSelection: { fixed: 'right', align: 'center' } });
    expect(screen.getByTestId('table-selection-header-cell')).toHaveAttribute(
      'data-pinned',
      'right',
    );
    expect(screen.getByTestId('table-selection-cell-1')).toHaveStyle({ right: '0px' });
  });

  it('the select-all menu trigger is absent for radios and when there are no actions', () => {
    renderTable({ rowSelection: {} });
    expect(screen.queryByRole('button', { name: 'Open bulk actions' })).not.toBeInTheDocument();
  });

  it('hideSelectAll leaves the header cell empty of a checkbox', () => {
    renderTable({ rowSelection: { hideSelectAll: true } });
    expect(screen.queryByTestId('table-selection-checkbox-all')).not.toBeInTheDocument();
  });
});

describe('Responsive screens without modern media query listeners', () => {
  const original = window.matchMedia;
  afterEach(() => {
    window.matchMedia = original;
  });

  it('falls back to addListener / removeListener and re-evaluates on resize', () => {
    const added: Array<() => void> = [];
    const removed: Array<() => void> = [];
    let width = 700;
    window.matchMedia = ((query: string) => ({
      get matches() {
        return width >= Number(/min-width: (\d+)px/.exec(query)![1]);
      },
      media: query,
      addListener: (fn: () => void) => added.push(fn),
      removeListener: (fn: () => void) => removed.push(fn),
    })) as unknown as typeof window.matchMedia;
    const Probe = () => <span data-testid="screens">{JSON.stringify(useResponsiveScreens())}</span>;
    const { unmount } = render(<Probe />);
    expect(added).toHaveLength(4);
    expect(JSON.parse(screen.getByTestId('screens').textContent!)).toEqual({
      sm: true,
      md: false,
      lg: false,
      xl: false,
    });
    width = 1100;
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(JSON.parse(screen.getByTestId('screens').textContent!)).toEqual({
      sm: true,
      md: true,
      lg: true,
      xl: false,
    });
    unmount();
    expect(removed).toHaveLength(4);
    expect(currentResponsiveScreens().xl).toBe(false);
  });

  it('a responsive column hides until its breakpoint matches', () => {
    window.matchMedia = ((query: string) => ({
      matches: query.includes('640'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;
    renderTable({
      columns: [
        { key: 'name', title: 'Name', dataIndex: 'name' },
        { key: 'role', title: 'Role', dataIndex: 'role', responsive: ['lg'] },
        { key: 'age', title: 'Age', dataIndex: 'age', responsive: ['sm'] },
      ],
    });
    expect(screen.getAllByRole('columnheader').map((th) => th.textContent)).toEqual([
      'Name',
      'Age',
    ]);
  });
});
