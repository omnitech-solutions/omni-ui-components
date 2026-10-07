import { act, renderHook } from '@testing-library/react';
import type { Row } from '@tanstack/react-table';
import { describe, expect, it, vi } from 'vitest';
import { useEditableHandlers } from '../../../src/Table/hooks/useEditableHandlers';
import { useEditingState } from '../../../src/Table/hooks/useTableState/useEditingState';
import type {
  TableCellRenderContext,
  TableColumn,
  TableDataRow,
  TableEditableConfig,
  TableProps,
} from '../../../src/Table/Table.types';
import { column, people, resolve, type Person } from './support';

type Opts = {
  columns?: TableColumn<Person>[];
  rowFor?: (record: Person) => Partial<TableDataRow<Person>>;
  root?: TableEditableConfig<Person, unknown> | null;
  onEdit?: TableProps<Person>['onEdit'];
};

const harness = ({ columns, rowFor, root = null, onEdit }: Opts = {}) => {
  const leaf = columns ?? [column('name', { editable: true }), column('age')];
  const rows = resolve(people, rowFor);
  const view = renderHook(() => {
    const editing = useEditingState();
    const handlers = useEditableHandlers<Person, unknown>({
      registry: {} as never,
      renderedLeafColumns: leaf,
      renderRows: rows.map((original) => ({ original }) as unknown as Row<(typeof rows)[number]>),
      rootEditableConfig: root,
      editValues: editing.editValues,
      setEditValues: editing.setEditValues,
      setEditErrors: editing.setEditErrors,
      setEditingCell: editing.setEditingCell,
      setEditingRowKey: editing.setEditingRowKey,
      setInternalCellValues: editing.setInternalCellValues,
      onEdit,
    });
    return { editing, ...handlers };
  });
  const ctxFor = (index: number, columnIndex = 0): TableCellRenderContext<Person> => ({
    record: rows[index].record,
    row: rows[index].row,
    column: leaf[columnIndex],
    rowIndex: index,
    columnIndex,
    registry: {} as never,
  });
  return { ...view, rows, leaf, ctxFor };
};

describe('useEditableHandlers cell editing', () => {
  it('builds a stable error key from row and column', () => {
    const { result } = harness();
    expect(result.current.editableErrorKey('r1', 'name')).toBe('r1:name');
  });

  it('begins a cell edit: stores the value, targets the cell, clears its error', () => {
    const { result, rows, leaf } = harness();
    const config = result.current.bodyCellEditableConfig(undefined, leaf[0]);
    act(() => result.current.editing.setEditErrors({ 'a:name': 'old' }));
    act(() => result.current.beginCellEdit(rows[0], leaf[0], 'Ada', null, config));
    expect(result.current.editing.editingCell).toEqual({ rowKey: 'a', columnKey: 'name' });
    expect(result.current.editing.editingRowKey).toBeNull();
    expect(result.current.editing.editValues).toEqual({ a: { name: 'Ada' } });
    expect(result.current.editing.editErrors['a:name']).toBeNull();
  });

  it('does nothing when neither a cell nor a row is editable', () => {
    const { result, rows, leaf } = harness();
    act(() => result.current.beginCellEdit(rows[0], leaf[1], 1, null, null));
    expect(result.current.editing.editingCell).toBeNull();
    expect(result.current.editing.editValues).toEqual({});
  });

  it('begins a row edit seeded from column values and initialValues', () => {
    const { result, rows, leaf } = harness();
    const rowConfig = {
      mode: 'row' as const,
      initialValues: (record: Person) => ({ name: `${record.name}!` }),
    };
    act(() => result.current.beginCellEdit(rows[1], leaf[0], 'Bob', rowConfig, null));
    expect(result.current.editing.editingRowKey).toBe('b');
    expect(result.current.editing.editingCell).toBeNull();
    expect(result.current.editing.editValues.b).toEqual({ name: 'Bob!', age: 41 });
  });

  it('does not reseed values when the row already has edits', () => {
    const { result, rows, leaf } = harness();
    act(() => result.current.editing.setEditValues({ b: { name: 'typed' } }));
    act(() => result.current.beginCellEdit(rows[1], leaf[0], 'Bob', { mode: 'row' }, null));
    expect(result.current.editing.editValues.b).toEqual({ name: 'typed' });
  });

  it('prefers a cell override value over the record when seeding a row', () => {
    const { result, rows } = harness({
      rowFor: (record) => (record.id === 'a' ? { cells: { name: { value: 'Override' } } } : {}),
    });
    expect(result.current.rowInitialEditableValues(rows[0], null)).toEqual({
      name: 'Override',
      age: 36,
    });
  });

  it('setEditableValue writes the value and clears the cell error', () => {
    const { result } = harness();
    act(() => result.current.editing.setEditErrors({ 'a:name': 'bad' }));
    act(() => result.current.setEditableValue('a', 'name', 'Zed'));
    expect(result.current.editing.editValues.a.name).toBe('Zed');
    expect(result.current.editing.editErrors['a:name']).toBeNull();
  });

  it('cancelCellEdit only closes the matching cell and clears its error', () => {
    const { result } = harness();
    act(() => {
      result.current.editing.setEditingCell({ rowKey: 'a', columnKey: 'name' });
      result.current.editing.setEditErrors({ 'a:name': 'bad' });
    });
    act(() => result.current.cancelCellEdit('b', 'name'));
    expect(result.current.editing.editingCell).toEqual({ rowKey: 'a', columnKey: 'name' });
    act(() => result.current.cancelCellEdit('a', 'name'));
    expect(result.current.editing.editingCell).toBeNull();
    expect(result.current.editing.editErrors['a:name']).toBeNull();
  });
});

describe('useEditableHandlers validation and configs', () => {
  it('validates with the cell config before the column config', () => {
    const { result, ctxFor } = harness();
    const cellValidate = vi.fn(() => 'cell says no');
    const columnValidate = vi.fn(() => 'column says no');
    const both = {
      mode: 'cell' as const,
      source: 'cell' as const,
      cellConfig: { validate: cellValidate },
      columnConfig: { mode: 'cell' as const, validate: columnValidate },
    };
    const ctx = ctxFor(0);
    expect(result.current.validateEditableCell(both, 'x', ctx)).toBe('cell says no');
    expect(cellValidate).toHaveBeenCalledWith('x', ctx);
    expect(columnValidate).not.toHaveBeenCalled();
  });

  it('falls back to the column validator with record and row, else passes', () => {
    const { result, ctxFor, rows } = harness();
    const columnValidate = vi.fn(() => 'bad');
    const config = {
      mode: 'cell' as const,
      source: 'column' as const,
      columnConfig: { mode: 'cell' as const, validate: columnValidate },
    };
    expect(result.current.validateEditableCell(config, 'x', ctxFor(0))).toBe('bad');
    expect(columnValidate).toHaveBeenCalledWith('x', people[0], rows[0].row);
    const none = { mode: 'cell' as const, source: 'column' as const };
    expect(result.current.validateEditableCell(none, 'x', ctxFor(0))).toBeNull();
  });

  it('only treats body cells as editable with an explicit config or bodyRows', () => {
    const plain = harness();
    const [name, age] = plain.leaf;
    expect(plain.result.current.bodyCellEditableConfig(undefined, name)).toMatchObject({
      source: 'column',
    });
    expect(plain.result.current.bodyCellEditableConfig(undefined, age)).toBeNull();

    const rooted = harness({ root: { bodyRows: true } });
    expect(rooted.result.current.bodyCellEditableConfig(undefined, age)).toEqual({
      mode: 'cell',
      source: 'column',
      columnConfig: { mode: 'cell' },
    });
    // A cell that opts out is never editable, even when the whole body is.
    expect(rooted.result.current.bodyCellEditableConfig({ editable: false }, age)).toBeNull();
    // A cell that opts in is editable without bodyRows.
    expect(plain.result.current.bodyCellEditableConfig({ editable: true }, age)).toMatchObject({
      source: 'cell',
    });
  });
});

describe('useEditableHandlers saveCellEdit', () => {
  it('saves the typed value: persists, notifies onEdit and closes the editor', async () => {
    const onEdit = vi.fn();
    const onSave = vi.fn();
    const { result, rows, leaf, ctxFor } = harness({ onEdit });
    const config = { mode: 'cell' as const, source: 'cell' as const, cellConfig: { onSave } };
    act(() => result.current.editing.setEditingCell({ rowKey: 'a', columnKey: 'name' }));
    act(() => result.current.setEditableValue('a', 'name', 'Grace'));
    let saved = false;
    await act(async () => {
      saved = await result.current.saveCellEdit('a', leaf[0], config, ctxFor(0));
    });
    expect(saved).toBe(true);
    expect(onSave).toHaveBeenCalledWith('Grace', expect.objectContaining({ record: people[0] }));
    expect(result.current.editing.internalCellValues).toEqual({ a: { name: 'Grace' } });
    expect(onEdit).toHaveBeenCalledWith({
      key: 'name',
      value: 'Grace',
      record: people[0],
      row: rows[0].row,
      column: leaf[0],
      rowKey: 'a',
    });
    expect(result.current.editing.editingCell).toBeNull();
  });

  it('an explicit nextValue wins over the stored edit value, including falsy values', async () => {
    const { result, leaf, ctxFor } = harness();
    const config = { mode: 'cell' as const, source: 'column' as const };
    act(() => result.current.setEditableValue('a', 'name', 'stored'));
    await act(async () => {
      await result.current.saveCellEdit('a', leaf[0], config, ctxFor(0), 0);
    });
    expect(result.current.editing.internalCellValues.a.name).toBe(0);
  });

  it('defaults to an empty string when nothing was typed', async () => {
    const { result, leaf, ctxFor } = harness();
    await act(async () => {
      await result.current.saveCellEdit(
        'a',
        leaf[0],
        { mode: 'cell', source: 'column' },
        ctxFor(0),
      );
    });
    expect(result.current.editing.internalCellValues.a.name).toBe('');
  });

  it('runs the column onSave with value, record and row when no cell onSave exists', async () => {
    const onSave = vi.fn();
    const { result, leaf, ctxFor, rows } = harness();
    const config = {
      mode: 'cell' as const,
      source: 'column' as const,
      columnConfig: { mode: 'cell' as const, onSave },
    };
    await act(async () => {
      await result.current.saveCellEdit('a', leaf[0], config, ctxFor(0), 'v');
    });
    expect(onSave).toHaveBeenCalledWith('v', people[0], rows[0].row);
  });

  it('rejects an invalid value: records the error, skips onSave and keeps editing', async () => {
    const onSave = vi.fn();
    const onEdit = vi.fn();
    const { result, leaf, ctxFor } = harness({ onEdit });
    const config = {
      mode: 'cell' as const,
      source: 'cell' as const,
      cellConfig: { validate: () => 'Required', onSave },
    };
    act(() => result.current.editing.setEditingCell({ rowKey: 'a', columnKey: 'name' }));
    let saved = true;
    await act(async () => {
      saved = await result.current.saveCellEdit('a', leaf[0], config, ctxFor(0), '');
    });
    expect(saved).toBe(false);
    expect(result.current.editing.editErrors['a:name']).toBe('Required');
    expect(onSave).not.toHaveBeenCalled();
    expect(onEdit).not.toHaveBeenCalled();
    expect(result.current.editing.editingCell).toEqual({ rowKey: 'a', columnKey: 'name' });
  });

  it('keeps another cell open when a different cell is saved', async () => {
    const { result, leaf, ctxFor } = harness();
    act(() => result.current.editing.setEditingCell({ rowKey: 'b', columnKey: 'name' }));
    await act(async () => {
      await result.current.saveCellEdit(
        'a',
        leaf[0],
        { mode: 'cell', source: 'column' },
        ctxFor(0),
        'x',
      );
    });
    expect(result.current.editing.editingCell).toEqual({ rowKey: 'b', columnKey: 'name' });
  });

  it('propagates a failing onSave and does not record the value', async () => {
    const { result, leaf, ctxFor } = harness();
    const config = {
      mode: 'cell' as const,
      source: 'cell' as const,
      cellConfig: {
        onSave: () => {
          throw new Error('server down');
        },
      },
    };
    await expect(result.current.saveCellEdit('a', leaf[0], config, ctxFor(0), 'x')).rejects.toThrow(
      'server down',
    );
    expect(result.current.editing.internalCellValues).toEqual({});
  });
});

describe('useEditableHandlers keyboard navigation', () => {
  const editableColumns = () => [
    column('name', { editable: true }),
    column('age', { editable: true }),
  ];

  it('finds the next and previous editable cell, wrapping across rows', () => {
    const { result, rows } = harness({ columns: editableColumns() });
    const next = result.current.editableCellTarget('a', 'age', 1);
    expect(next?.resolved).toBe(rows[1]);
    expect(next?.column.key).toBe('name');
    expect(next?.value).toBe('Bob');
    const prev = result.current.editableCellTarget('b', 'name', -1);
    expect(prev?.resolved).toBe(rows[0]);
    expect(prev?.column.key).toBe('age');
  });

  it('skips disabled rows and non-editable cells', () => {
    const { result } = harness({
      columns: [column('name', { editable: true }), column('age')],
      rowFor: (record) => ({ disabled: record.id === 'b' }),
    });
    expect(result.current.editableCellTarget('a', 'name', 1)?.resolved.key).toBe('c');
  });

  it('returns null at the ends and for unknown positions', () => {
    const { result } = harness({ columns: editableColumns() });
    expect(result.current.editableCellTarget('d', 'age', 1)).toBeNull();
    expect(result.current.editableCellTarget('a', 'name', -1)).toBeNull();
    expect(result.current.editableCellTarget('zzz', 'name', 1)).toBeNull();
    expect(result.current.editableCellTarget('a', 'zzz', 1)).toBeNull();
  });

  it('returns null when no rendered columns exist', () => {
    const { result } = harness({ columns: [] });
    expect(result.current.editableCellTarget('a', 'name', 1)).toBeNull();
  });

  it('does not navigate into cells editable only as a whole row', () => {
    const { result, rows } = harness({
      columns: [column('name', { editable: { mode: 'row' } })],
    });
    expect(result.current.editableCellTarget('a', 'name', 1)).toBeNull();
    expect(result.current.firstEditableCellTarget(rows[0])).toBeNull();
  });

  it('firstEditableCellTarget returns the first editable column of a row', () => {
    const { result, rows } = harness({
      columns: [column('age'), column('name', { editable: true })],
      rowFor: (record) => (record.id === 'a' ? { editable: { mode: 'row' } } : {}),
    });
    const target = result.current.firstEditableCellTarget(rows[0]);
    expect(target?.column.key).toBe('name');
    expect(target?.rowConfig).toEqual({ mode: 'row' });
    expect(target?.value).toBe('Ada');
  });

  it('firstEditableCellTarget is null for disabled rows or rows with nothing editable', () => {
    const disabled = harness({ rowFor: () => ({ disabled: true }) });
    expect(disabled.result.current.firstEditableCellTarget(disabled.rows[0])).toBeNull();
    const none = harness({ columns: [column('age')] });
    expect(none.result.current.firstEditableCellTarget(none.rows[0])).toBeNull();
  });
});

describe('useEditableHandlers row editing', () => {
  const rowColumns = () => [
    column('name', {
      editable: {
        mode: 'row',
        validate: (value) => (value === '' ? 'Name required' : null),
      },
    }),
    column('age', { editable: { mode: 'row' } }),
    column('id'),
  ];

  it('saves row values: onSave, internal values, onEdit per column, closes row', async () => {
    const onEdit = vi.fn();
    const onSave = vi.fn();
    const { result, rows } = harness({ columns: rowColumns(), onEdit });
    const rowConfig = { mode: 'row' as const, onSave };
    act(() => result.current.beginCellEdit(rows[0], rowColumns()[0], 'Ada', rowConfig, null));
    act(() => result.current.setEditableValue('a', 'name', 'Grace'));
    await act(async () => {
      await result.current.saveRowEdit(rows[0], rowConfig);
    });
    const values = { name: 'Grace', age: 36, id: 'a' };
    expect(onSave).toHaveBeenCalledWith(values, people[0], rows[0].row);
    expect(result.current.editing.internalCellValues.a).toEqual(values);
    expect(onEdit.mock.calls.map(([event]) => [event.key, event.value])).toEqual([
      ['name', 'Grace'],
      ['age', 36],
      ['id', 'a'],
    ]);
    expect(result.current.editing.editingRowKey).toBeNull();
  });

  it('blocks the save and reports per-column errors when a validator fails', async () => {
    const onSave = vi.fn();
    const onEdit = vi.fn();
    const { result, rows } = harness({ columns: rowColumns(), onEdit });
    const rowConfig = { mode: 'row' as const, onSave };
    act(() => result.current.beginCellEdit(rows[0], rowColumns()[0], 'Ada', rowConfig, null));
    act(() => result.current.setEditableValue('a', 'name', ''));
    await act(async () => {
      await result.current.saveRowEdit(rows[0], rowConfig);
    });
    expect(result.current.editing.editErrors['a:name']).toBe('Name required');
    expect(onSave).not.toHaveBeenCalled();
    expect(onEdit).not.toHaveBeenCalled();
    expect(result.current.editing.editingRowKey).toBe('a');
  });

  it('saves derived values for a never-edited row without an onSave', async () => {
    const onEdit = vi.fn();
    const { result, rows } = harness({ columns: rowColumns(), onEdit });
    await act(async () => {
      await result.current.saveRowEdit(rows[1], { mode: 'row' });
    });
    expect(result.current.editing.internalCellValues.b).toEqual({ name: 'Bob', age: 41, id: 'b' });
    expect(onEdit).toHaveBeenCalledTimes(3);
  });

  it('does not emit onEdit for columns missing from the edited values', async () => {
    const onEdit = vi.fn();
    const { result, rows } = harness({ columns: rowColumns(), onEdit });
    act(() => result.current.editing.setEditValues({ a: { name: 'Only' } }));
    await act(async () => {
      await result.current.saveRowEdit(rows[0], { mode: 'row' });
    });
    expect(onEdit.mock.calls.map(([event]) => event.key)).toEqual(['name']);
  });

  it('leaves another row open when a different row is saved', async () => {
    const { result, rows } = harness({ columns: rowColumns() });
    act(() => result.current.editing.setEditingRowKey('c'));
    await act(async () => {
      await result.current.saveRowEdit(rows[0], { mode: 'row' });
    });
    expect(result.current.editing.editingRowKey).toBe('c');
  });

  it('cancelRowEdit calls onCancel, closes the row and clears every column error', () => {
    const onCancel = vi.fn();
    const { result, rows } = harness({ columns: rowColumns() });
    act(() => {
      result.current.editing.setEditingRowKey('a');
      result.current.editing.setEditErrors({ 'a:name': 'bad', 'b:name': 'other' });
    });
    act(() => result.current.cancelRowEdit(rows[0], { mode: 'row', onCancel }));
    expect(onCancel).toHaveBeenCalledWith(people[0], rows[0].row);
    expect(result.current.editing.editingRowKey).toBeNull();
    expect(result.current.editing.editErrors['a:name']).toBeNull();
    expect(result.current.editing.editErrors['b:name']).toBe('other');
  });

  it('cancelRowEdit works without onCancel and keeps a different row open', () => {
    const { result, rows } = harness({ columns: rowColumns() });
    act(() => result.current.editing.setEditingRowKey('b'));
    act(() => result.current.cancelRowEdit(rows[0], { mode: 'row' }));
    expect(result.current.editing.editingRowKey).toBe('b');
  });
});
