import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import * as React from 'react';

import { Table } from '../../src/Table';
import type { TableColumn, TableRef } from '../../src/Table/Table.types';
import { baseColumns, bodyNames, type Person, people } from './fixtures';

describe('Table rendering', () => {
  it('renders one header cell per column and one row per record, in order', () => {
    const { container } = render(
      <Table<Person> columns={baseColumns} dataSource={people} rowKey="id" />,
    );
    expect(screen.getAllByRole('columnheader').map((th) => th.textContent)).toEqual([
      'Name',
      'Role',
      'Age',
    ]);
    expect(bodyNames(container)).toEqual(['Ada', 'Grace', 'Linus', 'Margaret']);
    expect(bodyNames(container, 'age')).toEqual(['36', '45', '28', '52']);
    expect(screen.getByTestId('table-body-row-3')).toHaveAttribute('data-row-key', '3');
  });

  it('prefixes every test id with testIdPrefix', () => {
    render(
      <Table<Person> columns={baseColumns} dataSource={people} rowKey="id" testIdPrefix="people" />,
    );
    expect(screen.getByTestId('people-root')).toBeInTheDocument();
    expect(screen.getByTestId('people-body-cell-1-name')).toHaveTextContent('Ada');
    expect(screen.queryByTestId('table-root')).not.toBeInTheDocument();
  });

  it('falls back to key, id, then index when rowKey is not given', () => {
    render(
      <Table
        columns={[{ key: 'v', dataIndex: 'v' }]}
        dataSource={[{ v: 'a', key: 'k1' }, { v: 'b', id: 7 }, { v: 'c' }]}
      />,
    );
    expect(screen.getByTestId('table-body-row-k1')).toBeInTheDocument();
    expect(screen.getByTestId('table-body-row-7')).toBeInTheDocument();
    expect(screen.getByTestId('table-body-row-2')).toBeInTheDocument();
  });

  it('supports a function rowKey and dotted / array dataIndex paths', () => {
    type Nested = { meta: { code: string }; label: string };
    render(
      <Table<Nested>
        columns={[
          { key: 'dotted', title: 'Dotted', dataIndex: 'meta.code' },
          { key: 'array', title: 'Array', dataIndex: ['meta', 'code'] },
        ]}
        dataSource={[{ meta: { code: 'X1' }, label: 'one' }]}
        rowKey={(record) => `custom-${record.label}`}
      />,
    );
    expect(screen.getByTestId('table-body-row-custom-one')).toBeInTheDocument();
    expect(screen.getByTestId('table-body-cell-custom-one-dotted')).toHaveTextContent('X1');
    expect(screen.getByTestId('table-body-cell-custom-one-array')).toHaveTextContent('X1');
  });

  it('column.render receives value, record, index and the row, and its output replaces the text', () => {
    const render1 = vi.fn(
      (value: unknown, record: Person, index: number) => `${String(value)}/${record.id}/${index}`,
    );
    render(
      <Table<Person>
        columns={[{ key: 'name', dataIndex: 'name', render: render1 }]}
        dataSource={people.slice(0, 2)}
        rowKey="id"
      />,
    );
    expect(screen.getByTestId('table-body-cell-1-name')).toHaveTextContent('Ada/1/0');
    expect(screen.getByTestId('table-body-cell-2-name')).toHaveTextContent('Grace/2/1');
    expect(render1.mock.calls[0][3]).toMatchObject({ key: 1, record: people[0] });
  });

  it('formats cells by valueType straight from the record (money, number, date)', () => {
    const columns: TableColumn<Person>[] = [
      { key: 'salary', dataIndex: 'salary', valueType: 'money' },
      { key: 'age', dataIndex: 'age', valueType: 'number' },
      { key: 'joined', dataIndex: 'joined', valueType: 'date' },
      { key: 'name', dataIndex: 'name', valueType: 'string' },
    ];
    render(<Table<Person> columns={columns} dataSource={[people[0]]} rowKey="id" />);
    expect(screen.getByTestId('table-body-cell-1-salary')).toHaveTextContent('$120,000.00');
    expect(screen.getByTestId('table-body-cell-1-age')).toHaveTextContent('36');
    expect(screen.getByTestId('table-body-cell-1-joined')).toHaveTextContent('Mar 5, 2020');
    expect(screen.getByTestId('table-body-cell-1-name')).toHaveTextContent('Ada');
  });

  it('routes column.type through the built-in row-data types, including icon and link', () => {
    const columns: TableColumn<Record<string, unknown>>[] = [
      { key: 'icon', type: 'icon', icon: 'check' },
      { key: 'iconByValue', type: 'icon', dataIndex: 'iconName' },
      { key: 'noIcon', type: 'icon', dataIndex: 'missing' },
      { key: 'link', type: 'link', dataIndex: 'link' },
      { key: 'amount', type: 'money', dataIndex: 'amount' },
    ];
    render(
      <Table
        columns={columns}
        dataSource={[
          {
            id: 1,
            iconName: 'folder',
            link: { href: 'https://example.test', label: 'Site' },
            amount: 5,
          },
        ]}
      />,
    );
    expect(screen.getByTestId('table-body-cell-1-icon').querySelector('svg')).toHaveClass(
      'lucide-check',
    );
    expect(screen.getByTestId('table-body-cell-1-iconByValue').querySelector('svg')).toHaveClass(
      'lucide-folder',
    );
    expect(screen.getByTestId('table-body-cell-1-noIcon')).toBeEmptyDOMElement();
    expect(screen.getByRole('link', { name: 'Site' })).toHaveAttribute(
      'href',
      'https://example.test',
    );
    expect(screen.getByTestId('table-body-cell-1-amount')).toHaveTextContent('$5.00');
  });

  it('lets rowDataTypes add or override a type', () => {
    const rowDataTypes = [
      { type: 'badge', render: ({ value }: { value: unknown }) => <em>{`[${String(value)}]`}</em> },
    ];
    render(
      <Table
        columns={[{ key: 'status', type: 'badge', dataIndex: 'status' }]}
        dataSource={[{ id: 1, status: 'new' }]}
        rowDataTypes={rowDataTypes}
      />,
    );
    expect(screen.getByText('[new]').tagName).toBe('EM');
  });

  it('cells[...] overrides drive value, kind renderers, custom render, colSpan, rowSpan, align and class', () => {
    const rows = [
      {
        key: 'a',
        cells: {
          name: {
            value: 'Override',
            className: 'custom-cell',
            align: 'right' as const,
            style: { color: 'red' },
          },
          role: { kind: 'money', value: 1234.5 },
          age: { value: 7, render: (value: unknown) => <b>{`age:${String(value)}`}</b> },
        },
      },
      {
        key: 'b',
        cells: {
          name: { value: 'Wide', colSpan: 2 },
          role: { value: 'hidden', colSpan: 0 },
          age: { value: 'x' },
        },
      },
    ];
    render(<Table<Person> columns={baseColumns} rows={rows} />);
    const name = screen.getByTestId('table-body-cell-a-name');
    expect(name).toHaveTextContent('Override');
    expect(name).toHaveClass('custom-cell');
    expect(name).toHaveStyle({ textAlign: 'right', color: 'red' });
    expect(screen.getByTestId('table-body-cell-a-role')).toHaveTextContent('$1,234.50');
    expect(screen.getByText('age:7').tagName).toBe('B');
    expect(screen.getByTestId('table-body-cell-b-name')).toHaveAttribute('colspan', '2');
    expect(screen.queryByTestId('table-body-cell-b-role')).not.toBeInTheDocument();
  });

  it('shows the empty state, with custom locale text, when there is no data', () => {
    const { rerender } = render(<Table<Person> columns={baseColumns} dataSource={[]} />);
    expect(screen.getByTestId('table-empty')).toHaveTextContent('No data');
    expect(screen.getByTestId('table-empty')).toHaveAttribute('colspan', '3');
    rerender(
      <Table<Person> columns={baseColumns} dataSource={[]} locale={{ emptyText: 'Nobody here' }} />,
    );
    expect(screen.getByTestId('table-empty')).toHaveTextContent('Nobody here');
  });

  it('hides the header when showHeader is false', () => {
    render(<Table<Person> columns={baseColumns} dataSource={people} showHeader={false} />);
    expect(screen.queryByTestId('table-header-wrapper')).not.toBeInTheDocument();
    expect(screen.getByTestId('table-root')).toHaveAttribute('data-show-header', 'false');
  });

  it('renders title, footer and summary with the current records', () => {
    const title = vi.fn((data: Person[]) => `Team (${data.length})`);
    const footer = vi.fn((data: Person[]) => `Total ${data.length}`);
    const summary = vi.fn((data: Person[]) => (
      <tr>
        <td>{data.reduce((sum, p) => sum + p.age, 0)}</td>
      </tr>
    ));
    render(
      <Table<Person>
        columns={baseColumns}
        dataSource={people}
        rowKey="id"
        title={title}
        footer={footer}
        summary={summary}
      />,
    );
    expect(screen.getByTestId('table-title')).toHaveTextContent('Team (4)');
    expect(screen.getByTestId('table-footer')).toHaveTextContent('Total 4');
    expect(screen.getByTestId('table-summary')).toHaveTextContent('161');
    expect(title.mock.calls[0][1]).toHaveLength(4);
  });

  it('applies root attributes: borders, appearance flags, size, theme, hoverable, bordered and scroll', () => {
    render(
      <Table<Person>
        columns={baseColumns}
        dataSource={people}
        rowKey="id"
        size="small"
        theme="dark"
        rowHoverable={false}
        bordered
        appearance={{ stripedRows: true, headerColumn: true, headerRow: false, borders: 'rows' }}
        scroll={{ x: 800, y: 200 }}
        className="my-table"
      />,
    );
    const root = screen.getByTestId('table-root');
    expect(root).toHaveClass('bui-table', 'my-table');
    expect(root).toHaveAttribute('data-size', 'small');
    expect(root).toHaveAttribute('data-theme', 'dark');
    expect(root).toHaveAttribute('data-row-hoverable', 'false');
    expect(root).toHaveAttribute('data-striped-rows', 'true');
    expect(root).toHaveAttribute('data-header-column', 'true');
    expect(root).toHaveAttribute('data-header-row', 'false');
    // `bordered` forces the grid regardless of appearance.borders
    expect(root).toHaveAttribute('data-borders', 'grid');
    expect(root).toHaveAttribute('data-scroll-x', '800');
    expect(root).toHaveAttribute('data-scroll-y', '200');
    expect(screen.getByTestId('table-scroll-body')).toHaveStyle({
      maxHeight: '200px',
      overflow: 'auto',
    });
    expect(screen.getByTestId('table-sticky-scrollbar')).toBeInTheDocument();
  });

  it('classNames and styles target semantic parts, including via a function', () => {
    render(
      <Table<Person>
        columns={baseColumns}
        dataSource={[people[0]]}
        rowKey="id"
        classNames={() => ({
          root: 'c-root',
          'header.cell': 'c-th',
          'body.cell': 'c-td',
          'body.row': 'c-tr',
        })}
        styles={{ 'header.cell': { letterSpacing: '2px' }, 'body.row': { opacity: 0.5 } }}
        rowClassName={(record) => `row-${record.id}`}
        onRow={(record) => ({ 'data-custom': record.name }) as never}
      />,
    );
    expect(screen.getByTestId('table-root')).toHaveClass('c-root');
    expect(screen.getByTestId('table-header-cell-name')).toHaveClass('c-th');
    expect(screen.getByTestId('table-header-cell-name')).toHaveStyle({ letterSpacing: '2px' });
    expect(screen.getByTestId('table-body-cell-1-name')).toHaveClass('c-td');
    const row = screen.getByTestId('table-body-row-1');
    expect(row).toHaveClass('c-tr', 'row-1');
    expect(row).toHaveStyle({ opacity: '0.5' });
    expect(row).toHaveAttribute('data-custom', 'Ada');
  });

  it('regression: onRow and row.onRow listeners and attributes reach the <tr>, not just className/style/onClick', () => {
    const onDoubleClick = vi.fn();
    const onRow = vi.fn((record: Person) => ({ onDoubleClick: () => onDoubleClick(record.name) }));
    render(
      <Table<Person>
        columns={baseColumns}
        dataSource={people.slice(0, 2)}
        rowKey="id"
        onRow={onRow}
      />,
    );
    fireEvent.doubleClick(screen.getByTestId('table-body-row-2'));
    expect(onDoubleClick).toHaveBeenCalledWith('Grace');
    expect(onRow.mock.calls[1]).toEqual([people[1], 1, expect.objectContaining({ key: 2 })]);
  });

  it('cell and header hooks (onCell, onHeaderCell, onHeaderRow) add attributes and listeners', () => {
    const onClick = vi.fn();
    const columns: TableColumn<Person>[] = [
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
        className: 'col-name',
        onCell: (record) => ({ title: `cell-${record.id}`, onClick }),
        onHeaderCell: () => ({ className: 'hdr-extra', 'aria-label': 'Name header' }),
      },
    ];
    render(
      <Table<Person>
        columns={columns}
        dataSource={[people[0]]}
        rowKey="id"
        onHeaderRow={() => ({ 'data-hr': 'yes' }) as never}
      />,
    );
    const cell = screen.getByTestId('table-body-cell-1-name');
    expect(cell).toHaveAttribute('title', 'cell-1');
    expect(cell).toHaveClass('col-name');
    cell.click();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('table-header-cell-name')).toHaveClass('hdr-extra', 'col-name');
    expect(screen.getByTestId('table-header-row-main')).toHaveAttribute('data-hr', 'yes');
  });

  it('pins columns and marks ellipsis cells with a title', () => {
    const columns: TableColumn<Person>[] = [
      { key: 'name', title: 'Name', dataIndex: 'name', fixed: 'left', ellipsis: true, width: 120 },
      {
        key: 'role',
        title: 'Role',
        dataIndex: 'role',
        fixed: 'right',
        ellipsis: { showTitle: false },
      },
    ];
    render(<Table<Person> columns={columns} dataSource={[people[0]]} rowKey="id" />);
    const name = screen.getByTestId('table-body-cell-1-name');
    expect(name).toHaveAttribute('data-pinned', 'left');
    expect(name).toHaveAttribute('data-ellipsis', 'true');
    expect(name).toHaveAttribute('title', 'Ada');
    expect(name).toHaveStyle({ position: 'sticky', left: '0px' });
    expect(screen.getByTestId('table-header-cell-name')).toHaveStyle({ width: '120px' });
    expect(screen.getByTestId('table-header-cell-name')).toHaveAttribute('title', 'Name');
    const role = screen.getByTestId('table-body-cell-1-role');
    expect(role).toHaveAttribute('data-pinned', 'right');
    expect(role).not.toHaveAttribute('title');
    expect(screen.getByTestId('table-table')).toHaveStyle({ tableLayout: 'fixed' });
  });

  it('renders grouped columns over two header rows with colSpan and rowSpan', () => {
    const columns: TableColumn<Person>[] = [
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
    render(<Table<Person> columns={columns} dataSource={[people[0]]} rowKey="id" />);
    expect(screen.getByTestId('table-header-cell-name')).toHaveAttribute('rowspan', '2');
    expect(screen.getByTestId('table-header-cell-work')).toHaveAttribute('colspan', '2');
    const leafRow = screen.getByTestId('table-header-row-leaf');
    expect(
      within(leafRow)
        .getAllByRole('columnheader')
        .map((th) => th.textContent),
    ).toEqual(['Role', 'Age']);
    expect(screen.getByTestId('table-body-cell-1-role')).toHaveTextContent('Engineer');
  });

  it('drops hidden columns', () => {
    render(
      <Table<Person>
        columns={[
          ...baseColumns,
          { key: 'secret', title: 'Secret', dataIndex: 'salary', hidden: true },
        ]}
        dataSource={people}
      />,
    );
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
  });

  it('column.title may be a function of the column info', () => {
    render(
      <Table<Person>
        columns={[
          { key: 'name', dataIndex: 'name', title: ({ column }) => `Title for ${column.key}` },
        ]}
        dataSource={[]}
      />,
    );
    expect(screen.getByRole('columnheader')).toHaveTextContent('Title for name');
  });

  it('merges per-column and per-row defaults from the column and row props', () => {
    render(
      <Table<Person>
        columns={[{ key: 'name', dataIndex: 'name' }]}
        column={{ className: 'default-col' }}
        dataSource={[people[0]]}
        rowKey="id"
        row={{ className: 'default-row' }}
      />,
    );
    expect(screen.getByTestId('table-body-cell-1-name')).toHaveClass('default-col');
    expect(screen.getByTestId('table-body-row-1')).toHaveClass('default-row');
  });

  it('row.hidden removes a row, row.disabled marks it, and row.onRow/onCell add attributes', () => {
    const rows = [
      {
        key: 'a',
        record: people[0],
        disabled: true,
        onRow: () => ({ 'data-from-row': 'y' }) as never,
      },
      { key: 'b', record: people[1], hidden: true },
      { key: 'c', record: people[2], onCell: () => ({ 'data-from-cell': 'z' }) as never },
    ];
    render(<Table<Person> columns={baseColumns} rows={rows} />);
    expect(screen.queryByTestId('table-body-row-b')).not.toBeInTheDocument();
    expect(screen.getByTestId('table-body-row-a')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByTestId('table-body-row-a')).toHaveAttribute('data-from-row', 'y');
    expect(screen.getByTestId('table-body-cell-c-name')).toHaveAttribute('data-from-cell', 'z');
    expect(screen.getByTestId('table-body-cell-a-name')).toHaveTextContent('Ada');
  });

  it('exposes nativeElement and a scrollTo handle through the ref, and forwards tableRef to the table', () => {
    const ref = React.createRef<TableRef>();
    const tableRef = React.createRef<HTMLTableElement>();
    render(
      <Table<Person>
        ref={ref}
        tableRef={tableRef}
        columns={baseColumns}
        dataSource={people}
        rowKey="id"
      />,
    );
    expect(ref.current?.nativeElement).toBe(screen.getByTestId('table-root'));
    expect(typeof ref.current?.scrollTo).toBe('function');
    expect(tableRef.current).toBe(screen.getByTestId('table-table'));
  });

  it('renders beforeTableContent inside the table and fires onScroll from the scroll body', () => {
    const onScroll = vi.fn();
    render(
      <Table<Person>
        columns={baseColumns}
        dataSource={people}
        rowKey="id"
        beforeTableContent={<colgroup data-testid="cols" />}
        onScroll={onScroll}
        scroll={{ y: 100 }}
      />,
    );
    expect(screen.getByTestId('table-table')).toContainElement(screen.getByTestId('cols'));
    screen.getByTestId('table-scroll-body').dispatchEvent(new Event('scroll', { bubbles: true }));
    expect(onScroll).toHaveBeenCalledTimes(1);
  });

  it('lets the renderers prop replace the empty state', () => {
    const Empty = ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="my-empty">custom:{children}</div>
    );
    render(
      <Table<Person> columns={baseColumns} dataSource={[]} renderers={{ empty: Empty } as never} />,
    );
    expect(screen.getByTestId('my-empty')).toHaveTextContent('custom:');
  });

  it('uses a registry override for a field renderer and for a structural component', () => {
    const BodyRow = ({
      children,
      record: _r,
      row: _row,
      rowIndex: _i,
      table: _t,
      props: _p,
      registry: _g,
      ...rest
    }: Record<string, unknown> & { children?: React.ReactNode }) => (
      <tr data-wrapped="yes" {...(rest as object)}>
        {children}
      </tr>
    );
    render(
      <Table<Person>
        columns={baseColumns}
        dataSource={[people[0]]}
        rowKey="id"
        registry={{ components: { BodyRow } as never }}
      />,
    );
    expect(screen.getByTestId('table-body-row-1')).toHaveAttribute('data-wrapped', 'yes');
  });
});
