import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Table } from '../../src/Table';
import type { TableColumn, TableProps } from '../../src/Table/Table.types';
import { baseColumns, bodyNames, type Person, people } from './fixtures';

const tree: Person[] = [
  {
    id: 1,
    name: 'Org',
    role: 'root',
    age: 0,
    salary: 0,
    joined: '',
    children: [
      {
        id: 11,
        name: 'Team A',
        role: 'team',
        age: 0,
        salary: 0,
        joined: '',
        children: [{ id: 111, name: 'Ada', role: 'dev', age: 36, salary: 1, joined: '' }],
      },
      { id: 12, name: 'Team B', role: 'team', age: 0, salary: 0, joined: '' },
    ],
  },
  { id: 2, name: 'Solo', role: 'solo', age: 1, salary: 0, joined: '' },
];

describe('Table tree data', () => {
  it('starts collapsed, with an inline toggle only on rows that have children', () => {
    const { container } = render(
      <Table<Person> columns={baseColumns} dataSource={tree} rowKey="id" />,
    );
    expect(bodyNames(container).map((n) => n.trim())).toEqual(['Org', 'Solo']);
    expect(screen.getByTestId('table-expand-toggle-1')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'Expand row 1' })).toBeInTheDocument();
    expect(screen.queryByTestId('table-expand-toggle-2')).not.toBeInTheDocument();
    // tree mode puts the toggle in the first data cell instead of a separate column
    expect(screen.queryByTestId('table-expand-header-cell')).not.toBeInTheDocument();
  });

  it('expanding shows children indented one level per depth and collapsing hides them again', () => {
    const onExpand = vi.fn();
    const onExpandedRowsChange = vi.fn();
    const { container } = render(
      <Table<Person>
        columns={baseColumns}
        dataSource={tree}
        rowKey="id"
        expandable={{ onExpand, onExpandedRowsChange, indentSize: 10 }}
      />,
    );
    fireEvent.click(screen.getByTestId('table-expand-toggle-1'));
    expect(bodyNames(container).map((n) => n.trim())).toEqual(['Org', 'Team A', 'Team B', 'Solo']);
    expect(screen.getByTestId('table-body-row-11')).toHaveAttribute('data-indent', '1');
    expect(onExpand).toHaveBeenCalledWith(true, tree[0], expect.objectContaining({ key: 1 }));
    expect(onExpandedRowsChange).toHaveBeenLastCalledWith(['1']);
    fireEvent.click(screen.getByTestId('table-expand-toggle-11'));
    expect(screen.getByTestId('table-body-row-111')).toHaveAttribute('data-indent', '2');
    fireEvent.click(screen.getByTestId('table-expand-toggle-1'));
    expect(screen.queryByTestId('table-body-row-11')).not.toBeInTheDocument();
    expect(onExpand).toHaveBeenLastCalledWith(false, tree[0], expect.anything());
  });

  it('defaultExpandAllRows opens every level', () => {
    render(
      <Table<Person>
        columns={baseColumns}
        dataSource={tree}
        rowKey="id"
        expandable={{ defaultExpandAllRows: true }}
      />,
    );
    expect(screen.getByTestId('table-body-row-111')).toBeInTheDocument();
  });

  it('defaultExpandedRowKeys opens only the listed rows', () => {
    render(
      <Table<Person>
        columns={baseColumns}
        dataSource={tree}
        rowKey="id"
        expandable={{ defaultExpandedRowKeys: [1] }}
      />,
    );
    expect(screen.getByTestId('table-body-row-11')).toBeInTheDocument();
    expect(screen.queryByTestId('table-body-row-111')).not.toBeInTheDocument();
  });

  it('controlled expandedRowKeys only moves when the parent updates them', () => {
    const onExpandedRowsChange = vi.fn();
    const { rerender } = render(
      <Table<Person>
        columns={baseColumns}
        dataSource={tree}
        rowKey="id"
        expandable={{ expandedRowKeys: [], onExpandedRowsChange }}
      />,
    );
    fireEvent.click(screen.getByTestId('table-expand-toggle-1'));
    expect(onExpandedRowsChange).toHaveBeenCalledWith(['1']);
    expect(screen.queryByTestId('table-body-row-11')).not.toBeInTheDocument();
    rerender(
      <Table<Person>
        columns={baseColumns}
        dataSource={tree}
        rowKey="id"
        expandable={{ expandedRowKeys: ['1'], onExpandedRowsChange }}
      />,
    );
    expect(screen.getByTestId('table-body-row-11')).toBeInTheDocument();
  });

  it('uses childrenColumnName to find nested records', () => {
    const data = [{ id: 1, name: 'P', kids: [{ id: 2, name: 'C' }] }];
    render(
      <Table
        columns={[{ key: 'name', title: 'Name', dataIndex: 'name' }]}
        dataSource={data}
        rowKey="id"
        expandable={{ childrenColumnName: 'kids', defaultExpandAllRows: true }}
      />,
    );
    expect(screen.getByTestId('table-body-row-2')).toHaveAttribute('data-indent', '1');
  });

  it('rowExpandable limits which rows get a toggle', () => {
    render(
      <Table<Person>
        columns={baseColumns}
        dataSource={tree}
        rowKey="id"
        expandable={{ rowExpandable: (record) => record.id !== 1 }}
      />,
    );
    expect(screen.queryByTestId('table-expand-toggle-1')).not.toBeInTheDocument();
  });

  it('expandIcon replaces the toggle and its onExpand toggles the row', () => {
    render(
      <Table<Person>
        columns={baseColumns}
        dataSource={tree}
        rowKey="id"
        expandable={{
          expandIcon: ({ expanded, expandable, record, onExpand }) =>
            expandable ? (
              <a data-testid={`icon-${record.id}`} onClick={(event) => onExpand(record, event)}>
                {expanded ? 'open' : 'closed'}
              </a>
            ) : null,
        }}
      />,
    );
    expect(screen.getByTestId('icon-1')).toHaveTextContent('closed');
    fireEvent.click(screen.getByTestId('icon-1'));
    expect(screen.getByTestId('icon-1')).toHaveTextContent('open');
    expect(screen.getByTestId('table-body-row-11')).toBeInTheDocument();
  });
});

describe('Table expandedRowRender', () => {
  const props: Partial<TableProps<Person>> = {
    expandable: { expandedRowRender: (record) => <p>{`details for ${record.name}`}</p> },
  };

  it('adds an expand column, and renders the details row spanning all columns when expanded', () => {
    const { container } = render(
      <Table<Person> columns={baseColumns} dataSource={people} rowKey="id" {...props} />,
    );
    expect(screen.getByTestId('table-expand-header-cell')).toBeInTheDocument();
    expect(screen.queryByText('details for Ada')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Expand row 1' }));
    expect(screen.getByText('details for Ada')).toBeInTheDocument();
    expect(screen.getByTestId('table-expanded-cell-1')).toHaveAttribute('colspan', '4');
    expect(container.querySelectorAll('tbody tr')).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'Collapse row 1' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Collapse row 1' }));
    expect(screen.queryByText('details for Ada')).not.toBeInTheDocument();
  });

  it('expandRowByClick toggles when the row itself is clicked', () => {
    render(
      <Table<Person>
        columns={baseColumns}
        dataSource={people}
        rowKey="id"
        expandable={{
          expandRowByClick: true,
          expandedRowRender: (record) => <p>{`details for ${record.name}`}</p>,
          expandedRowClassName: 'expanded-extra',
        }}
      />,
    );
    fireEvent.click(screen.getByTestId('table-body-row-2'));
    expect(screen.getByText('details for Grace')).toBeInTheDocument();
    expect(screen.getByTestId('table-expanded-row-2')).toHaveClass('expanded-extra');
    fireEvent.click(screen.getByTestId('table-body-row-2'));
    expect(screen.queryByText('details for Grace')).not.toBeInTheDocument();
  });

  it('expandedRowRender receives record, index, indent, expanded and the row', () => {
    const expandedRowRender = vi.fn(() => 'x');
    render(
      <Table<Person>
        columns={baseColumns}
        dataSource={people}
        rowKey="id"
        expandable={{ expandedRowRender, defaultExpandedRowKeys: [3] }}
      />,
    );
    expect(expandedRowRender).toHaveBeenCalledWith(
      people[2],
      2,
      0,
      true,
      expect.objectContaining({ key: 3 }),
    );
  });

  it('columnTitle, columnWidth and a function expandedRowClassName apply', () => {
    render(
      <Table<Person>
        columns={baseColumns}
        dataSource={people}
        rowKey="id"
        expandable={{
          columnTitle: 'More',
          columnWidth: 50,
          fixed: 'right',
          expandedRowRender: () => 'x',
          defaultExpandedRowKeys: [1],
          expandedRowClassName: (record) => `exp-${record.id}`,
        }}
      />,
    );
    const header = screen.getByTestId('table-expand-header-cell');
    expect(header).toHaveTextContent('More');
    expect(header).toHaveStyle({ width: '50px' });
    expect(header).toHaveAttribute('data-pinned', 'right');
    expect(screen.getByTestId('table-expanded-row-1')).toHaveClass('exp-1');
  });

  it('showExpandColumn=false moves the toggle into the first data cell', () => {
    render(
      <Table<Person>
        columns={baseColumns}
        dataSource={people}
        rowKey="id"
        expandable={{ showExpandColumn: false, expandedRowRender: () => 'x' }}
      />,
    );
    expect(screen.queryByTestId('table-expand-header-cell')).not.toBeInTheDocument();
    expect(screen.getByTestId('table-body-cell-1-name')).toContainElement(
      screen.getByTestId('table-expand-toggle-1'),
    );
  });

  it('rows that are not rowExpandable show a spacer instead of a toggle', () => {
    render(
      <Table<Person>
        columns={baseColumns}
        dataSource={people}
        rowKey="id"
        expandable={{ expandedRowRender: () => 'x', rowExpandable: (record) => record.id === 1 }}
      />,
    );
    expect(screen.getByTestId('table-expand-toggle-1')).toBeInTheDocument();
    expect(screen.queryByTestId('table-expand-toggle-2')).not.toBeInTheDocument();
    expect(
      screen.getByTestId('table-expand-cell-2').querySelector('.bui-table-expand-spacer'),
    ).toBeInTheDocument();
  });
});

describe('Table pagination', () => {
  const many: Person[] = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `P${i + 1}`,
    role: 'r',
    age: i,
    salary: 0,
    joined: '',
  }));

  it('is off by default and, once on, pages by pageSize (or shows everything when no size is given)', () => {
    const { container, rerender } = render(
      <Table<Person> columns={baseColumns} dataSource={many} rowKey="id" />,
    );
    expect(bodyNames(container)).toHaveLength(25);
    expect(screen.queryByTestId('table-pagination-root')).not.toBeInTheDocument();
    rerender(
      <Table<Person>
        columns={baseColumns}
        dataSource={many}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />,
    );
    expect(bodyNames(container)).toHaveLength(10);
    expect(bodyNames(container)[0]).toBe('P1');
    expect(screen.getByTestId('table-pagination-root')).toBeInTheDocument();
  });

  it('navigates with page numbers and prev/next and reports onChange', () => {
    const onPageChange = vi.fn();
    const onChange = vi.fn();
    const { container } = render(
      <Table<Person>
        columns={baseColumns}
        dataSource={many}
        rowKey="id"
        pagination={{ pageSize: 10, onChange: onPageChange }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(bodyNames(container)[0]).toBe('P11');
    expect(onPageChange).toHaveBeenCalledWith(2, 10);
    const [pagination, , , extra] = onChange.mock.calls.at(-1)!;
    expect(pagination).toMatchObject({ current: 2, pageSize: 10, total: 25 });
    expect(extra.action).toBe('paginate');
    fireEvent.click(screen.getByRole('button', { name: /previous|prev/i }));
    expect(bodyNames(container)[0]).toBe('P1');
  });

  it('the last page holds the remainder', () => {
    const { container } = render(
      <Table<Person>
        columns={baseColumns}
        dataSource={many}
        rowKey="id"
        pagination={{ pageSize: 10, defaultCurrent: 3 }}
      />,
    );
    expect(bodyNames(container)).toEqual(['P21', 'P22', 'P23', 'P24', 'P25']);
  });

  it('controlled current / pageSize follow the props', () => {
    const { container, rerender } = render(
      <Table<Person>
        columns={baseColumns}
        dataSource={many}
        rowKey="id"
        pagination={{ current: 2, pageSize: 5 }}
      />,
    );
    expect(bodyNames(container)).toEqual(['P6', 'P7', 'P8', 'P9', 'P10']);
    rerender(
      <Table<Person>
        columns={baseColumns}
        dataSource={many}
        rowKey="id"
        pagination={{ current: 1, pageSize: 5 }}
      />,
    );
    expect(bodyNames(container)[0]).toBe('P1');
  });

  it('placement controls where the pager renders, and "none" hides it', () => {
    const { rerender } = render(
      <Table<Person>
        columns={baseColumns}
        dataSource={many}
        rowKey="id"
        pagination={{ pageSize: 10, placement: ['topEnd', 'bottomStart'] }}
      />,
    );
    expect(screen.getAllByTestId(/^table-pagination-root/)).toHaveLength(2);
    rerender(
      <Table<Person>
        columns={baseColumns}
        dataSource={many}
        rowKey="id"
        pagination={{ pageSize: 10, placement: ['none'] }}
      />,
    );
    expect(screen.queryAllByTestId(/^table-pagination-root/)).toHaveLength(0);
  });

  it('a filter that changes the row count returns to page one', () => {
    const columns: TableColumn<Person>[] = [
      { key: 'name', title: 'Name', dataIndex: 'name' },
      { key: 'age', title: 'Age', dataIndex: 'age', filters: [{ text: '0', value: 0 }] },
    ];
    const { container } = render(
      <Table<Person>
        columns={columns}
        dataSource={many}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(bodyNames(container)[0]).toBe('P11');
    fireEvent.click(screen.getByRole('button', { name: 'Filter Age' }));
    fireEvent.click(screen.getByTestId('table-filter-option-age-0'));
    fireEvent.click(screen.getByTestId('table-filter-confirm-age'));
    expect(bodyNames(container)).toEqual(['P1']);
  });

  it('total overrides the page count for server-side data', () => {
    render(
      <Table<Person>
        columns={baseColumns}
        dataSource={many.slice(0, 10)}
        rowKey="id"
        pagination={{ pageSize: 10, total: 100 }}
      />,
    );
    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
  });

  it('regression: choosing another page size re-pages the data (the old size is not restored) and reports onShowSizeChange', async () => {
    const onShowSizeChange = vi.fn();
    const { container } = render(
      <Table<Person>
        columns={baseColumns}
        dataSource={many}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20],
          onShowSizeChange,
        }}
      />,
    );
    const trigger = screen.getByRole('combobox', { name: 'Rows per page' });
    expect(trigger).toHaveTextContent('10');
    const user = userEvent.setup();
    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: '5' }));
    await waitFor(() => expect(bodyNames(container)).toHaveLength(5));
    expect(onShowSizeChange).toHaveBeenCalledWith(1, 5);
    expect(onShowSizeChange).toHaveBeenCalledTimes(1);
  });
});
