import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { Table } from '../../src/Table';
import type { TableColumn, TableProps } from '../../src/Table/Table.types';
import { baseColumns, bodyNames, type Person, people } from './fixtures';

const sortable: TableColumn<Person>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
  { key: 'age', title: 'Age', dataIndex: 'age', sorter: true },
  { key: 'role', title: 'Role', dataIndex: 'role' },
];

const renderTable = (props: Partial<TableProps<Person>> = {}) =>
  render(<Table<Person> columns={sortable} dataSource={people} rowKey="id" {...props} />);

describe('Table sorting', () => {
  it('only columns with a sorter render a sort button', () => {
    renderTable();
    expect(screen.getByRole('button', { name: 'Sort Name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sort Age' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sort Role' })).not.toBeInTheDocument();
  });

  it('cycles ascend, descend, off and reorders the rows by the column value', () => {
    const { container } = renderTable();
    const sortAge = screen.getByRole('button', { name: 'Sort Age' });
    fireEvent.click(sortAge);
    expect(bodyNames(container)).toEqual(['Linus', 'Ada', 'Grace', 'Margaret']);
    expect(sortAge).toHaveAttribute('aria-sort', 'ascending');
    expect(screen.getByTestId('table-header-cell-age')).toHaveAttribute('aria-sort', 'ascending');
    fireEvent.click(sortAge);
    expect(bodyNames(container)).toEqual(['Margaret', 'Grace', 'Ada', 'Linus']);
    expect(sortAge).toHaveAttribute('aria-sort', 'descending');
    fireEvent.click(sortAge);
    expect(bodyNames(container)).toEqual(['Ada', 'Grace', 'Linus', 'Margaret']);
    expect(sortAge).not.toHaveAttribute('aria-sort');
  });

  it('uses a custom compare function', () => {
    const { container } = renderTable({ dataSource: [people[3], people[0], people[2], people[1]] });
    fireEvent.click(screen.getByRole('button', { name: 'Sort Name' }));
    expect(bodyNames(container)).toEqual(['Ada', 'Grace', 'Linus', 'Margaret']);
    fireEvent.click(screen.getByRole('button', { name: 'Sort Name' }));
    expect(bodyNames(container)).toEqual(['Margaret', 'Linus', 'Grace', 'Ada']);
  });

  it('single-sorter columns replace each other: sorting a second column clears the first', () => {
    renderTable();
    fireEvent.click(screen.getByRole('button', { name: 'Sort Age' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sort Name' }));
    expect(screen.getByRole('button', { name: 'Sort Name' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    expect(screen.getByRole('button', { name: 'Sort Age' })).not.toHaveAttribute('aria-sort');
  });

  it('multiple-priority sorters combine, higher priority first', () => {
    const data: Person[] = [
      { id: 1, name: 'B', role: 'x', age: 1, salary: 0, joined: '' },
      { id: 2, name: 'A', role: 'x', age: 2, salary: 0, joined: '' },
      { id: 3, name: 'A', role: 'x', age: 1, salary: 0, joined: '' },
    ];
    const columns: TableColumn<Person>[] = [
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
        sorter: { compare: (a, b) => a.name.localeCompare(b.name), multiple: 2 },
      },
      {
        key: 'age',
        title: 'Age',
        dataIndex: 'age',
        sorter: { compare: (a, b) => a.age - b.age, multiple: 1 },
      },
    ];
    const { container } = render(<Table<Person> columns={columns} dataSource={data} rowKey="id" />);
    fireEvent.click(screen.getByRole('button', { name: 'Sort Age' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sort Name' }));
    // name (priority 2) first, then age
    expect(
      Array.from(container.querySelectorAll('tbody tr')).map((tr) =>
        tr.getAttribute('data-row-key'),
      ),
    ).toEqual(['3', '2', '1']);
  });

  it('honours sortDirections on the table and on the column', () => {
    renderTable({ sortDirections: ['descend'] });
    const sortAge = screen.getByRole('button', { name: 'Sort Age' });
    fireEvent.click(sortAge);
    expect(sortAge).toHaveAttribute('aria-sort', 'descending');
    fireEvent.click(sortAge);
    expect(sortAge).not.toHaveAttribute('aria-sort');
  });

  it('column.sortDirections overrides the table setting', () => {
    const columns: TableColumn<Person>[] = [
      {
        key: 'age',
        title: 'Age',
        dataIndex: 'age',
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
    ];
    render(<Table<Person> columns={columns} dataSource={people} rowKey="id" />);
    fireEvent.click(screen.getByRole('button', { name: 'Sort Age' }));
    expect(screen.getByRole('button', { name: 'Sort Age' })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
  });

  it('starts sorted from defaultSortOrder and from a controlled sortOrder', () => {
    const { container, unmount } = renderTable({
      columns: sortable.map((c) =>
        c.key === 'age' ? { ...c, defaultSortOrder: 'descend' as const } : c,
      ),
    });
    expect(bodyNames(container)).toEqual(['Margaret', 'Grace', 'Ada', 'Linus']);
    unmount();
    const controlled = render(
      <Table<Person>
        columns={sortable.map((c) =>
          c.key === 'age' ? { ...c, sortOrder: 'ascend' as const } : c,
        )}
        dataSource={people}
        rowKey="id"
      />,
    );
    expect(bodyNames(controlled.container)).toEqual(['Linus', 'Ada', 'Grace', 'Margaret']);
  });

  it('reports sorter, filters and pagination through onChange and the full state through onStateChange', () => {
    const onChange = vi.fn();
    const onStateChange = vi.fn();
    renderTable({ onChange, onStateChange });
    fireEvent.click(screen.getByRole('button', { name: 'Sort Age' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    const [pagination, filters, sorter, extra] = onChange.mock.calls[0];
    expect(pagination).toMatchObject({ current: 1 });
    expect(filters).toEqual({});
    expect(sorter).toMatchObject({ columnKey: 'age', order: 'ascend' });
    expect(extra.action).toBe('sort');
    expect(extra.currentDataSource).toHaveLength(4);
    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ sorting: [{ id: 'age', desc: false }] }),
    );
  });

  it('renders a custom sortIcon with the current order', () => {
    const sortIcon = vi.fn(({ sortOrder }: { sortOrder: string | null }) => (
      <i data-testid="icon">{String(sortOrder)}</i>
    ));
    renderTable({
      columns: [{ key: 'age', title: 'Age', dataIndex: 'age', sorter: true, sortIcon }],
    });
    expect(screen.getByTestId('icon')).toHaveTextContent('null');
    fireEvent.click(screen.getByRole('button', { name: 'Sort Age' }));
    expect(screen.getByTestId('icon')).toHaveTextContent('ascend');
  });

  it('sorts numeric strings and money by number, not alphabetically', () => {
    const data = [
      { id: 1, amount: '$1,000' },
      { id: 2, amount: '$250' },
      { id: 3, amount: '$30' },
    ];
    const { container } = render(
      <Table
        columns={[
          { key: 'amount', title: 'Amount', dataIndex: 'amount', valueType: 'money', sorter: true },
        ]}
        dataSource={data}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Sort Amount' }));
    expect(
      Array.from(container.querySelectorAll('tbody tr')).map((tr) =>
        tr.getAttribute('data-row-key'),
      ),
    ).toEqual(['3', '2', '1']);
  });
});

describe('Table filtering', () => {
  const filterColumns: TableColumn<Person>[] = [
    { key: 'name', title: 'Name', dataIndex: 'name' },
    {
      key: 'role',
      title: 'Role',
      dataIndex: 'role',
      filters: [
        { text: 'Engineer', value: 'Engineer' },
        { text: 'Manager', value: 'Manager' },
        { text: 'Admiral', value: 'Admiral' },
      ],
    },
  ];
  const renderFiltered = (props: Partial<TableProps<Person>> = {}, columns = filterColumns) =>
    render(<Table<Person> columns={columns} dataSource={people} rowKey="id" {...props} />);

  const openRoleFilter = () => fireEvent.click(screen.getByRole('button', { name: 'Filter Role' }));

  it('opens a dropdown of options, applies the selection on OK and closes', () => {
    const { container } = renderFiltered();
    expect(screen.queryByTestId('table-filter-dropdown-role')).not.toBeInTheDocument();
    openRoleFilter();
    expect(screen.getByRole('button', { name: 'Filter Role' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    fireEvent.click(screen.getByTestId('table-filter-option-role-Engineer'));
    // nothing applied until confirm
    expect(bodyNames(container)).toHaveLength(4);
    fireEvent.click(screen.getByTestId('table-filter-confirm-role'));
    expect(bodyNames(container)).toEqual(['Ada', 'Linus']);
    expect(screen.queryByTestId('table-filter-dropdown-role')).not.toBeInTheDocument();
    expect(screen.getByTestId('table-filter-trigger-role')).toHaveAttribute(
      'data-filtered',
      'true',
    );
  });

  it('regression: a numeric filter value matches equal numbers, not a "number range" or a substring', () => {
    const columns: TableColumn<Person>[] = [
      {
        key: 'age',
        title: 'Age',
        dataIndex: 'age',
        filters: [
          { text: '28', value: 28 },
          { text: '45', value: 45 },
        ],
      },
    ];
    const { container } = render(
      <Table<Person> columns={columns} dataSource={people} rowKey="id" />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter Age' }));
    fireEvent.click(screen.getByTestId('table-filter-option-age-28'));
    fireEvent.click(screen.getByTestId('table-filter-option-age-45'));
    fireEvent.click(screen.getByTestId('table-filter-confirm-age'));
    expect(bodyNames(container, 'age')).toEqual(['45', '28']);
  });

  it('regression: a text filter is an exact match, so "Eng" does not select Engineer', () => {
    const columns: TableColumn<Person>[] = [
      { key: 'role', title: 'Role', dataIndex: 'role', filters: [{ text: 'Eng', value: 'Eng' }] },
    ];
    render(<Table<Person> columns={columns} dataSource={people} rowKey="id" />);
    fireEvent.click(screen.getByRole('button', { name: 'Filter Role' }));
    fireEvent.click(screen.getByTestId('table-filter-option-role-Eng'));
    fireEvent.click(screen.getByTestId('table-filter-confirm-role'));
    expect(screen.getByTestId('table-empty')).toBeInTheDocument();
  });

  it('multiple options OR together; Reset clears the filter', () => {
    const { container } = renderFiltered();
    openRoleFilter();
    fireEvent.click(screen.getByTestId('table-filter-option-role-Engineer'));
    fireEvent.click(screen.getByTestId('table-filter-option-role-Manager'));
    fireEvent.click(screen.getByTestId('table-filter-confirm-role'));
    expect(bodyNames(container)).toEqual(['Ada', 'Linus', 'Margaret']);
    openRoleFilter();
    expect(
      (screen.getByTestId('table-filter-option-role-Engineer') as HTMLInputElement).checked,
    ).toBe(true);
    fireEvent.click(screen.getByTestId('table-filter-reset-role'));
    expect(bodyNames(container)).toHaveLength(4);
    expect(screen.getByTestId('table-filter-trigger-role')).toHaveAttribute(
      'data-filtered',
      'false',
    );
  });

  it('filterMultiple=false renders radios that hold a single value', () => {
    const { container } = renderFiltered({}, [
      filterColumns[0],
      { ...filterColumns[1], filterMultiple: false },
    ]);
    openRoleFilter();
    const engineer = screen.getByTestId('table-filter-option-role-Engineer') as HTMLInputElement;
    expect(engineer.type).toBe('radio');
    fireEvent.click(engineer);
    fireEvent.click(screen.getByTestId('table-filter-option-role-Manager'));
    fireEvent.click(screen.getByTestId('table-filter-confirm-role'));
    expect(bodyNames(container)).toEqual(['Margaret']);
    openRoleFilter();
    expect(
      (screen.getByTestId('table-filter-option-role-Manager') as HTMLInputElement).checked,
    ).toBe(true);
    expect(
      (screen.getByTestId('table-filter-option-role-Engineer') as HTMLInputElement).checked,
    ).toBe(false);
    fireEvent.click(screen.getByTestId('table-filter-reset-role'));
    expect(bodyNames(container)).toHaveLength(4);
  });

  it('uses onFilter when provided', () => {
    const columns: TableColumn<Person>[] = [
      {
        key: 'age',
        title: 'Age',
        dataIndex: 'age',
        filters: [{ text: '40+', value: 40 }],
        onFilter: (value, record) => record.age >= Number(value),
      },
    ];
    const { container } = render(
      <Table<Person> columns={columns} dataSource={people} rowKey="id" />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter Age' }));
    fireEvent.click(screen.getByTestId('table-filter-option-age-40'));
    fireEvent.click(screen.getByTestId('table-filter-confirm-age'));
    expect(bodyNames(container, 'age')).toEqual(['45', '52']);
  });

  it('starts filtered from defaultFilteredValue and a controlled filteredValue', () => {
    const { container } = renderFiltered({}, [
      filterColumns[0],
      { ...filterColumns[1], defaultFilteredValue: ['Manager'] },
    ]);
    expect(bodyNames(container)).toEqual(['Margaret']);
    expect(screen.getByTestId('table-filter-trigger-role')).toHaveAttribute(
      'data-filtered',
      'true',
    );
  });

  it('Reset returns to defaultFilteredValue when filterResetToDefaultFilteredValue is set', () => {
    const { container } = renderFiltered({}, [
      filterColumns[0],
      {
        ...filterColumns[1],
        defaultFilteredValue: ['Manager'],
        filterResetToDefaultFilteredValue: true,
      },
    ]);
    openRoleFilter();
    fireEvent.click(screen.getByTestId('table-filter-option-role-Manager'));
    fireEvent.click(screen.getByTestId('table-filter-confirm-role'));
    expect(bodyNames(container)).toHaveLength(4);
    openRoleFilter();
    fireEvent.click(screen.getByTestId('table-filter-reset-role'));
    expect(bodyNames(container)).toEqual(['Margaret']);
  });

  it('search narrows the option list by text, with a custom matcher when given', () => {
    renderFiltered({}, [filterColumns[0], { ...filterColumns[1], filterSearch: true }]);
    openRoleFilter();
    fireEvent.change(screen.getByTestId('table-filter-search-role'), { target: { value: 'man' } });
    expect(screen.queryByTestId('table-filter-option-role-Engineer')).not.toBeInTheDocument();
    expect(screen.getByTestId('table-filter-option-role-Manager')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Search Role filters' })).toBeInTheDocument();
  });

  it('custom filterSearch decides what matches', () => {
    renderFiltered({}, [
      filterColumns[0],
      {
        ...filterColumns[1],
        filterSearch: (input, item) => item.value === 'Admiral' && input === 'x',
      },
    ]);
    openRoleFilter();
    fireEvent.change(screen.getByTestId('table-filter-search-role'), { target: { value: 'x' } });
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    expect(screen.getByTestId('table-filter-option-role-Admiral')).toBeInTheDocument();
  });

  it('tree filters show group labels and filter children by search', () => {
    const columns: TableColumn<Person>[] = [
      {
        key: 'role',
        title: 'Role',
        dataIndex: 'role',
        filterMode: 'tree',
        filterSearch: true,
        filters: [
          {
            text: 'Tech',
            value: 'tech',
            children: [
              { text: 'Engineer', value: 'Engineer' },
              { text: 'Designer', value: 'Designer' },
            ],
          },
          { text: 'Other', value: 'other', children: [{ text: 'Manager', value: 'Manager' }] },
        ],
      },
    ];
    render(<Table<Person> columns={columns} dataSource={people} rowKey="id" />);
    fireEvent.click(screen.getByRole('button', { name: 'Filter Role' }));
    expect(screen.getByTestId('table-filter-group-role-tech')).toHaveTextContent('Tech');
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    fireEvent.change(screen.getByTestId('table-filter-search-role'), { target: { value: 'engi' } });
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    expect(screen.queryByTestId('table-filter-group-role-other')).not.toBeInTheDocument();
    // a matching group label keeps all of its children
    fireEvent.change(screen.getByTestId('table-filter-search-role'), { target: { value: 'tech' } });
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('filterOnChange commits as soon as an option is toggled', () => {
    const { container } = renderFiltered({}, [
      filterColumns[0],
      { ...filterColumns[1], filterOnChange: true },
    ]);
    openRoleFilter();
    fireEvent.click(screen.getByTestId('table-filter-option-role-Admiral'));
    expect(bodyNames(container)).toEqual(['Grace']);
    expect(screen.getByTestId('table-filter-dropdown-role')).toBeInTheDocument();
  });

  it('closing by Escape or an outside pointerdown commits the draft; filterOnClose=false discards it', () => {
    const { container, unmount } = renderFiltered();
    openRoleFilter();
    fireEvent.click(screen.getByTestId('table-filter-option-role-Manager'));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(bodyNames(container)).toEqual(['Margaret']);
    expect(screen.queryByTestId('table-filter-dropdown-role')).not.toBeInTheDocument();
    unmount();

    const second = renderFiltered();
    openRoleFilter();
    fireEvent.click(screen.getByTestId('table-filter-option-role-Manager'));
    fireEvent.pointerDown(document.body);
    expect(bodyNames(second.container)).toEqual(['Margaret']);
    second.unmount();

    const third = renderFiltered({}, [
      filterColumns[0],
      { ...filterColumns[1], filterOnClose: false },
    ]);
    openRoleFilter();
    fireEvent.click(screen.getByTestId('table-filter-option-role-Manager'));
    fireEvent.pointerDown(document.body);
    expect(bodyNames(third.container)).toHaveLength(4);
    expect(screen.queryByTestId('table-filter-dropdown-role')).not.toBeInTheDocument();
  });

  it('a pointerdown inside the dropdown does not close it', () => {
    renderFiltered();
    openRoleFilter();
    fireEvent.pointerDown(screen.getByTestId('table-filter-option-role-Manager'));
    expect(screen.getByTestId('table-filter-dropdown-role')).toBeInTheDocument();
  });

  it('a custom filterDropdown gets draft keys and confirm / clearFilters / close', () => {
    const columns: TableColumn<Person>[] = [
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
        filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters, close }) => (
          <div data-testid="custom-dropdown">
            <span data-testid="selected">{selectedKeys.join(',')}</span>
            <button onClick={() => setSelectedKeys(['Ada'])}>pick</button>
            <button onClick={confirm}>apply</button>
            <button onClick={clearFilters}>clear</button>
            <button onClick={close}>close</button>
          </div>
        ),
      },
    ];
    const { container } = render(
      <Table<Person> columns={columns} dataSource={people} rowKey="id" />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter Name' }));
    fireEvent.click(screen.getByText('pick'));
    expect(screen.getByTestId('selected')).toHaveTextContent('Ada');
    fireEvent.click(screen.getByText('apply'));
    expect(bodyNames(container)).toEqual(['Ada']);
    fireEvent.click(screen.getByRole('button', { name: 'Filter Name' }));
    fireEvent.click(screen.getByText('clear'));
    expect(bodyNames(container)).toHaveLength(4);
    fireEvent.click(screen.getByRole('button', { name: 'Filter Name' }));
    fireEvent.click(screen.getByText('close'));
    expect(screen.queryByTestId('custom-dropdown')).not.toBeInTheDocument();
  });

  it('a static ReactNode filterDropdown is rendered as is', () => {
    render(
      <Table<Person>
        columns={[
          { key: 'name', title: 'Name', dataIndex: 'name', filterDropdown: <p>static panel</p> },
        ]}
        dataSource={people}
        rowKey="id"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter Name' }));
    expect(screen.getByText('static panel')).toBeInTheDocument();
  });

  it('controlled dropdown open state is driven by filterDropdownProps and reports changes', () => {
    const onOpenChange = vi.fn();
    const columns = [
      filterColumns[0],
      { ...filterColumns[1], filterDropdownProps: { open: true, onOpenChange } },
    ];
    renderFiltered({}, columns);
    expect(screen.getByTestId('table-filter-dropdown-role')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Filter Role' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    // still open: the parent owns the state
    expect(screen.getByTestId('table-filter-dropdown-role')).toBeInTheDocument();
  });

  it('a filterIcon without filters renders an indicator only; a function icon receives the filtered flag', () => {
    const icon = vi.fn((filtered: boolean) => <u data-testid="fi">{filtered ? 'on' : 'off'}</u>);
    render(
      <Table<Person>
        columns={[
          { key: 'name', title: 'Name', dataIndex: 'name', filterIcon: icon, filtered: true },
        ]}
        dataSource={people}
        rowKey="id"
      />,
    );
    const indicator = screen.getByTestId('table-filter-icon-name');
    expect(indicator).toHaveAttribute('data-filtered', 'true');
    expect(within(indicator).getByTestId('fi')).toHaveTextContent('on');
    expect(screen.queryByRole('button', { name: 'Filter Name' })).not.toBeInTheDocument();
  });

  it('locale labels replace OK and Reset', () => {
    renderFiltered({ locale: { filterConfirm: 'Apply', filterReset: 'Clear all' } });
    openRoleFilter();
    expect(screen.getByTestId('table-filter-confirm-role')).toHaveTextContent('Apply');
    expect(screen.getByTestId('table-filter-reset-role')).toHaveTextContent('Clear all');
  });

  it('reports filters through onChange with the filter action', () => {
    const onChange = vi.fn();
    renderFiltered({ onChange });
    openRoleFilter();
    fireEvent.click(screen.getByTestId('table-filter-option-role-Engineer'));
    fireEvent.click(screen.getByTestId('table-filter-confirm-role'));
    const [, filters, , extra] = onChange.mock.calls.at(-1)!;
    expect(filters).toEqual({ role: ['Engineer'] });
    expect(extra.action).toBe('filter');
  });

  it('shows the empty state when the filter removes every row', () => {
    const columns = [
      filterColumns[0],
      { ...filterColumns[1], filters: [{ text: 'Ghost', value: 'Ghost' }] },
    ];
    renderFiltered({}, columns);
    openRoleFilter();
    fireEvent.click(screen.getByTestId('table-filter-option-role-Ghost'));
    fireEvent.click(screen.getByTestId('table-filter-confirm-role'));
    expect(screen.getByTestId('table-empty')).toBeInTheDocument();
  });
});

describe('plain header', () => {
  it('without sorter or filters a header is just its title', () => {
    render(<Table<Person> columns={baseColumns} dataSource={people} rowKey="id" />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
