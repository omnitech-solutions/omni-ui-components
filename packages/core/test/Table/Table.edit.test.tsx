import '@testing-library/jest-dom';
import * as React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Table } from '../../src/Table';
import type { TableColumn, TableProps } from '../../src/Table/Table.types';
import { type Person, people } from './fixtures';

const rows3 = people.slice(0, 3);
const editableColumns = (extra: Partial<TableColumn<Person>> = {}): TableColumn<Person>[] => [
  { key: 'name', title: 'Name', dataIndex: 'name', editable: true, ...extra },
  { key: 'role', title: 'Role', dataIndex: 'role', editable: true },
  { key: 'age', title: 'Age', dataIndex: 'age' },
];

const renderTable = (props: Partial<TableProps<Person>> = {}) =>
  render(<Table<Person> columns={editableColumns()} dataSource={rows3} rowKey="id" {...props} />);

const cell = (id: number, key: string) => screen.getByTestId(`table-body-cell-${id}-${key}`);
const input = (id: number, key: string) => screen.getByTestId(`table-edit-input-${id}-${key}`) as HTMLInputElement;

describe('Table cell editing', () => {
  it('marks editable cells and leaves the others plain', () => {
    renderTable();
    expect(cell(1, 'name')).toHaveAttribute('data-editable', 'true');
    expect(cell(1, 'name')).toHaveAttribute('tabindex', '0');
    expect(cell(1, 'age')).not.toHaveAttribute('data-editable');
    fireEvent.click(cell(1, 'age'));
    expect(screen.queryByTestId('table-edit-input-1-age')).not.toBeInTheDocument();
  });

  it('click opens an input with the current value; Enter commits it to the cell, onEdit and onSave', async () => {
    const onEdit = vi.fn();
    const onSave = vi.fn();
    renderTable({ onEdit, columns: editableColumns({ editable: { mode: 'cell', onSave } }) });
    fireEvent.click(cell(1, 'name'));
    expect(cell(1, 'name')).toHaveAttribute('data-editing', 'true');
    expect(input(1, 'name').value).toBe('Ada');
    expect(input(1, 'name')).toHaveAccessibleName('Edit name');
    fireEvent.change(input(1, 'name'), { target: { value: 'Ada L.' } });
    fireEvent.keyDown(input(1, 'name'), { key: 'Enter' });
    await waitFor(() => expect(cell(1, 'name')).toHaveTextContent('Ada L.'));
    expect(cell(1, 'name')).not.toHaveAttribute('data-editing');
    expect(onSave).toHaveBeenCalledWith('Ada L.', people[0], expect.objectContaining({ key: 1 }));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ key: 'name', value: 'Ada L.', rowKey: '1', record: people[0] }));
    // the source record is not mutated: the edit is held by the table
    expect(people[0].name).toBe('Ada');
  });

  it('keyboard Enter or Space on a focused editable cell starts editing', () => {
    renderTable();
    fireEvent.keyDown(cell(2, 'role'), { key: 'Enter' });
    expect(input(2, 'role').value).toBe('Admiral');
    fireEvent.keyDown(input(2, 'role'), { key: 'Escape' });
    fireEvent.keyDown(cell(2, 'role'), { key: ' ' });
    expect(input(2, 'role')).toBeInTheDocument();
  });

  it('Escape cancels without saving', () => {
    const onEdit = vi.fn();
    renderTable({ onEdit });
    fireEvent.click(cell(1, 'name'));
    fireEvent.change(input(1, 'name'), { target: { value: 'Changed' } });
    fireEvent.keyDown(input(1, 'name'), { key: 'Escape' });
    expect(screen.queryByTestId('table-edit-input-1-name')).not.toBeInTheDocument();
    expect(cell(1, 'name')).toHaveTextContent('Ada');
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('blur saves the pending value', async () => {
    const onEdit = vi.fn();
    renderTable({ onEdit });
    fireEvent.click(cell(3, 'name'));
    fireEvent.change(input(3, 'name'), { target: { value: 'Linus T.' } });
    fireEvent.blur(input(3, 'name'));
    await waitFor(() => expect(cell(3, 'name')).toHaveTextContent('Linus T.'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('validation errors keep the editor open, show an alert and block onSave until fixed', async () => {
    const onSave = vi.fn();
    const validate = vi.fn((value: unknown) => (String(value).trim() ? null : 'Name is required'));
    renderTable({ columns: editableColumns({ editable: { mode: 'cell', validate, onSave } }) });
    fireEvent.click(cell(1, 'name'));
    fireEvent.change(input(1, 'name'), { target: { value: '  ' } });
    fireEvent.keyDown(input(1, 'name'), { key: 'Enter' });
    expect(await screen.findByRole('alert')).toHaveTextContent('Name is required');
    expect(onSave).not.toHaveBeenCalled();
    expect(cell(1, 'name')).toHaveAttribute('data-editing', 'true');
    expect(validate).toHaveBeenCalledWith('  ', people[0], expect.objectContaining({ key: 1 }));
    // typing clears the error, a valid value then saves
    fireEvent.change(input(1, 'name'), { target: { value: 'Ada' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.keyDown(input(1, 'name'), { key: 'Enter' });
    await waitFor(() => expect(onSave).toHaveBeenCalledWith('Ada', people[0], expect.anything()));
  });

  it('Tab saves and moves to the next editable cell, skipping non-editable columns; Shift+Tab goes back', async () => {
    renderTable();
    fireEvent.click(cell(1, 'name'));
    fireEvent.change(input(1, 'name'), { target: { value: 'A2' } });
    fireEvent.keyDown(input(1, 'name'), { key: 'Tab' });
    await waitFor(() => expect(input(1, 'role')).toBeInTheDocument());
    expect(cell(1, 'name')).toHaveTextContent('A2');
    // age is not editable: Tab from role jumps to the next row's name
    fireEvent.keyDown(input(1, 'role'), { key: 'Tab' });
    await waitFor(() => expect(input(2, 'name')).toBeInTheDocument());
    fireEvent.keyDown(input(2, 'name'), { key: 'Tab', shiftKey: true });
    await waitFor(() => expect(input(1, 'role')).toBeInTheDocument());
  });

  it('Tab on the very last editable cell does nothing unless rows can be appended', async () => {
    renderTable();
    fireEvent.click(cell(3, 'role'));
    fireEvent.keyDown(input(3, 'role'), { key: 'Tab' });
    await act(async () => {});
    expect(input(3, 'role')).toBeInTheDocument();
  });

  it('Tab in the last editable cell appends a row (extendable.rows) and starts editing its first cell', async () => {
    const { container } = renderTable({ extendable: { rows: true } });
    fireEvent.click(cell(3, 'role'));
    fireEvent.keyDown(input(3, 'role'), { key: 'Tab' });
    await waitFor(() => expect(container.querySelectorAll('tbody tr')).toHaveLength(4));
    const appendedInput = await screen.findByTestId('table-edit-input-row-appended-1-name');
    expect(appendedInput).toBeInTheDocument();
  });

  it('editable.onAppendRow supplies the row appended on Tab', async () => {
    const onAppendRow = vi.fn(() => ({ key: 'extra', record: { id: 99, name: '', role: '', age: 0, salary: 0, joined: '' } }));
    const { container } = renderTable({ editable: { appendRowOnTab: true, onAppendRow }, extendable: { rows: { onAppend: () => ({ key: 'extra', record: { id: 99, name: '', role: '', age: 0, salary: 0, joined: '' } }) } } });
    fireEvent.click(cell(3, 'role'));
    fireEvent.keyDown(input(3, 'role'), { key: 'Tab' });
    await waitFor(() => expect(onAppendRow).toHaveBeenCalled());
    expect(onAppendRow.mock.calls[0]).toEqual([expect.objectContaining({ rows: expect.any(Array), columns: expect.any(Array) })]);
    // the consumer owns the data: the table does not add the returned row itself, and extendable's own append is skipped
    expect(container.querySelectorAll('tbody tr')).toHaveLength(3);
  });

  it('a column renderEditor replaces the input and gets value, onChange, onSave, onCancel and onNavigate', async () => {
    const onSave = vi.fn();
    const renderEditor = vi.fn((ctx) => (
      <div data-testid="editor">
        <span data-testid="editor-value">{String(ctx.value)}</span>
        <span data-testid="editor-mode">{ctx.mode}</span>
        <button onClick={() => ctx.onChange('typed')}>change</button>
        <button onClick={() => ctx.onSave()}>save</button>
        <button onClick={() => ctx.onSave('direct')}>save-direct</button>
        <button onClick={() => ctx.onCancel()}>cancel</button>
        <button onClick={() => ctx.onNavigate(1, 'nav')}>next</button>
      </div>
    ));
    renderTable({ columns: editableColumns({ editable: { mode: 'cell', renderEditor, onSave } }) });
    fireEvent.click(cell(1, 'name'));
    expect(screen.getByTestId('editor-value')).toHaveTextContent('Ada');
    expect(screen.getByTestId('editor-mode')).toHaveTextContent('cell');
    fireEvent.click(screen.getByText('change'));
    expect(screen.getByTestId('editor-value')).toHaveTextContent('typed');
    fireEvent.click(screen.getByText('save'));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith('typed', people[0], expect.anything()));
    expect(screen.queryByTestId('editor')).not.toBeInTheDocument();
    fireEvent.click(cell(1, 'name'));
    fireEvent.click(screen.getByText('cancel'));
    expect(screen.queryByTestId('editor')).not.toBeInTheDocument();
    fireEvent.click(cell(1, 'name'));
    fireEvent.click(screen.getByText('save-direct'));
    await waitFor(() => expect(onSave).toHaveBeenLastCalledWith('direct', people[0], expect.anything()));
    fireEvent.click(cell(1, 'name'));
    fireEvent.click(screen.getByText('next'));
    await waitFor(() => expect(cell(1, 'role')).toHaveAttribute('data-editing', 'true'));
    expect(cell(1, 'name')).toHaveTextContent('nav');
  });

  it('registry editors are chosen by valueType', () => {
    const numberEditor = vi.fn(() => <span data-testid="num-editor" />);
    render(
      <Table<Person>
        columns={[{ key: 'age', title: 'Age', dataIndex: 'age', valueType: 'number', editable: true }]}
        dataSource={rows3}
        rowKey="id"
        registry={{ editors: { number: numberEditor } }}
      />,
    );
    fireEvent.click(cell(1, 'age'));
    expect(screen.getByTestId('num-editor')).toBeInTheDocument();
  });

  it('cell override editable=false wins over the column; editable=true on a cell enables it', () => {
    const rows = [
      { key: 'a', record: people[0], cells: { name: { editable: false }, age: { editable: true } } },
    ];
    render(<Table<Person> columns={editableColumns()} rows={rows} />);
    expect(cell('a' as never, 'name')).not.toHaveAttribute('data-editable');
    expect(cell('a' as never, 'age')).toHaveAttribute('data-editable', 'true');
    fireEvent.click(cell('a' as never, 'age'));
    expect(screen.getByTestId('table-edit-input-a-age')).toBeInTheDocument();
  });

  it('table-level editable makes every body cell editable and ignores disabled rows when tabbing', async () => {
    const rows = [
      { key: 'r1', record: people[0] },
      { key: 'r2', record: people[1], disabled: true },
      { key: 'r3', record: people[2] },
    ];
    render(<Table<Person> columns={[{ key: 'name', dataIndex: 'name', title: 'Name' }]} rows={rows} editable />);
    fireEvent.click(cell('r1' as never, 'name'));
    fireEvent.keyDown(screen.getByTestId('table-edit-input-r1-name'), { key: 'Tab' });
    await waitFor(() => expect(screen.getByTestId('table-edit-input-r3-name')).toBeInTheDocument());
  });

  it('editable.bodyRows=false turns the table-level switch off for plain columns', () => {
    render(<Table<Person> columns={[{ key: 'name', dataIndex: 'name', title: 'Name' }]} dataSource={rows3} rowKey="id" editable={{ bodyRows: false }} />);
    expect(cell(1, 'name')).not.toHaveAttribute('data-editable');
  });

  it('a cell onClick that prevents default stops editing from starting', () => {
    renderTable({ columns: editableColumns({ onCell: () => ({ onClick: (event) => event.preventDefault() }) }) });
    fireEvent.click(cell(1, 'name'));
    expect(screen.queryByTestId('table-edit-input-1-name')).not.toBeInTheDocument();
  });
});

describe('Table row editing', () => {
  const rowColumns: TableColumn<Person>[] = [
    { key: 'name', title: 'Name', dataIndex: 'name', editable: { mode: 'row', validate: (value) => (String(value) ? null : 'Required') } },
    { key: 'role', title: 'Role', dataIndex: 'role', editable: { mode: 'row' } },
    { key: 'age', title: 'Age', dataIndex: 'age' },
  ];

  it('opens an input in every column of the row, saves all values together and reports each', async () => {
    const onSave = vi.fn();
    const onEdit = vi.fn();
    render(
      <Table<Person>
        columns={rowColumns}
        rows={[{ key: 1, record: people[0], editable: { mode: 'row', onSave } }, { key: 2, record: people[1] }]}
        onEdit={onEdit}
      />,
    );
    fireEvent.click(screen.getByTestId('table-body-cell-1-name'));
    expect(input(1, 'name').value).toBe('Ada');
    expect(input(1, 'role').value).toBe('Engineer');
    expect(screen.queryByTestId('table-edit-input-2-name')).not.toBeInTheDocument();
    fireEvent.change(input(1, 'name'), { target: { value: 'Ada L.' } });
    fireEvent.change(input(1, 'role'), { target: { value: 'Lead' } });
    fireEvent.keyDown(input(1, 'role'), { key: 'Enter' });
    await waitFor(() => expect(screen.getByTestId('table-body-cell-1-name')).toHaveTextContent('Ada L.'));
    expect(screen.getByTestId('table-body-cell-1-role')).toHaveTextContent('Lead');
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0][0]).toMatchObject({ name: 'Ada L.', role: 'Lead', age: 36 });
    expect(onEdit.mock.calls.map(([commit]) => commit.key).sort()).toEqual(['age', 'name', 'role']);
  });

  it('validation blocks a row save, and Escape cancels with onCancel and no changes', async () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(<Table<Person> columns={rowColumns} rows={[{ key: 1, record: people[0], editable: { mode: 'row', onSave, onCancel } }]} />);
    fireEvent.click(screen.getByTestId('table-body-cell-1-name'));
    fireEvent.change(input(1, 'name'), { target: { value: '' } });
    fireEvent.keyDown(input(1, 'name'), { key: 'Enter' });
    expect(await screen.findByRole('alert')).toHaveTextContent('Required');
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.keyDown(input(1, 'name'), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledWith(people[0], expect.objectContaining({ key: 1 }));
    expect(screen.getByTestId('table-body-cell-1-name')).toHaveTextContent('Ada');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('initialValues seed the row editors', () => {
    render(
      <Table<Person>
        columns={rowColumns}
        rows={[{ key: 1, record: people[0], editable: { mode: 'row', initialValues: (record) => ({ name: `${record.name}!` }) } }]}
      />,
    );
    fireEvent.click(screen.getByTestId('table-body-cell-1-name'));
    expect(input(1, 'name').value).toBe('Ada!');
  });

  it('regression: a custom editor saving a row via onSave(value) saves that value, not the stale one', async () => {
    const renderEditor = vi.fn((ctx) => (
      <button data-testid={`ed-${ctx.column.key}`} onClick={() => ctx.onSave('X')}>
        {ctx.mode}
      </button>
    ));
    render(
      <Table<Person>
        columns={[{ key: 'name', title: 'Name', dataIndex: 'name', editable: { mode: 'row', renderEditor } }]}
        rows={[{ key: 1, record: people[0], editable: true }]}
      />,
    );
    fireEvent.click(screen.getByTestId('table-body-cell-1-name'));
    expect(screen.getByTestId('ed-name')).toHaveTextContent('row');
    fireEvent.click(screen.getByTestId('ed-name'));
    await waitFor(() => expect(screen.getByTestId('table-body-cell-1-name')).toHaveTextContent('X'));
  });
});
