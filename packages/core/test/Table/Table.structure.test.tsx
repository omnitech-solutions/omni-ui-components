import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Table } from '../../src/Table';
import type { TableColumn, TableProps } from '../../src/Table/Table.types';
import { baseColumns, bodyNames, type Person, people } from './fixtures';

const renderTable = (props: Partial<TableProps<Person>> = {}) =>
  render(<Table<Person> columns={baseColumns} dataSource={people} rowKey="id" {...props} />);

describe('Table row and column reordering', () => {
  const draggableRows = people.map((record) => ({ key: record.id, record, draggable: true }));

  it('draggable rows get a handle column and ArrowUp / ArrowDown move the row, reporting the new order', () => {
    const onRowOrderChange = vi.fn();
    const { container } = render(
      <Table<Person>
        columns={baseColumns}
        rows={draggableRows}
        onRowOrderChange={onRowOrderChange}
      />,
    );
    expect(screen.getByTestId('table-row-drag-header-cell')).toBeInTheDocument();
    const handle = screen.getByRole('button', { name: 'Reorder row 2' });
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    expect(bodyNames(container)).toEqual(['Ada', 'Linus', 'Grace', 'Margaret']);
    expect(onRowOrderChange).toHaveBeenCalledWith(['1', '3', '2', '4'], expect.any(Array), [
      people[0],
      people[2],
      people[1],
      people[3],
    ]);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Reorder row 2' }), { key: 'ArrowUp' });
    expect(bodyNames(container)).toEqual(['Ada', 'Grace', 'Linus', 'Margaret']);
  });

  it('moving past either end does nothing', () => {
    const onRowOrderChange = vi.fn();
    render(
      <Table<Person>
        columns={baseColumns}
        rows={draggableRows}
        onRowOrderChange={onRowOrderChange}
      />,
    );
    fireEvent.keyDown(screen.getByRole('button', { name: 'Reorder row 1' }), { key: 'ArrowUp' });
    fireEvent.keyDown(screen.getByRole('button', { name: 'Reorder row 4' }), { key: 'ArrowDown' });
    expect(onRowOrderChange).not.toHaveBeenCalled();
  });

  it('rows that are not draggable, or are disabled, have no handle and are skipped', () => {
    const rows = [
      { key: 1, record: people[0], draggable: true },
      { key: 2, record: people[1], draggable: true, disabled: true },
      { key: 3, record: people[2] },
      { key: 4, record: people[3], draggable: true },
    ];
    const { container } = render(<Table<Person> columns={baseColumns} rows={rows} />);
    expect(screen.queryByRole('button', { name: 'Reorder row 2' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reorder row 3' })).not.toBeInTheDocument();
    // row 1 moves "down" to the next draggable row, which is row 4
    fireEvent.keyDown(screen.getByRole('button', { name: 'Reorder row 1' }), { key: 'ArrowDown' });
    expect(bodyNames(container)).toEqual(['Grace', 'Linus', 'Margaret', 'Ada']);
  });

  it('draggable columns get handles and ArrowLeft / ArrowRight reorder them', () => {
    const onColumnOrderChange = vi.fn();
    const onStateChange = vi.fn();
    const columns: TableColumn<Person>[] = baseColumns.map((c) => ({ ...c, draggable: true }));
    render(
      <Table<Person>
        columns={columns}
        dataSource={people}
        rowKey="id"
        onColumnOrderChange={onColumnOrderChange}
        onStateChange={onStateChange}
      />,
    );
    fireEvent.keyDown(screen.getByRole('button', { name: 'Reorder column name' }), {
      key: 'ArrowRight',
    });
    expect(onColumnOrderChange).toHaveBeenCalledWith(['role', 'name', 'age']);
    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ columnOrder: ['role', 'name', 'age'] }),
    );
    expect(screen.getAllByRole('columnheader').map((th) => th.textContent)).toEqual([
      'Role',
      'Name',
      'Age',
    ]);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Reorder column age' }), {
      key: 'ArrowRight',
    });
    expect(onColumnOrderChange).toHaveBeenCalledTimes(1);
  });

  it('other keys on a handle are ignored', () => {
    const onColumnOrderChange = vi.fn();
    render(
      <Table<Person>
        columns={baseColumns.map((c) => ({ ...c, draggable: true }))}
        dataSource={people}
        rowKey="id"
        onColumnOrderChange={onColumnOrderChange}
      />,
    );
    fireEvent.keyDown(screen.getByRole('button', { name: 'Reorder column name' }), { key: 'a' });
    fireEvent.keyDown(screen.getByRole('button', { name: 'Reorder column name' }), {
      key: 'ArrowDown',
    });
    expect(onColumnOrderChange).not.toHaveBeenCalled();
  });
});

describe('Table extendable', () => {
  it('shows append controls only for the enabled sides', () => {
    const { unmount } = renderTable({ extendable: true });
    expect(screen.getByTestId('table-append-row')).toBeInTheDocument();
    expect(screen.getByTestId('table-append-column')).toBeInTheDocument();
    unmount();
    renderTable({ extendable: { rows: true, columns: false } });
    expect(screen.getByRole('button', { name: 'Append row' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Append column' })).not.toBeInTheDocument();
  });

  it('controls:false hides the buttons; no extendable means no wrapper at all', () => {
    const { container, unmount } = renderTable({ extendable: { rows: true, controls: false } });
    expect(screen.queryByTestId('table-append-row')).not.toBeInTheDocument();
    unmount();
    const plain = renderTable();
    expect(plain.container.querySelector('.bui-table-extend-wrapper')).toBeNull();
    expect(container).toBeDefined();
  });

  it('Append row adds an empty row with a cell per column, Append column adds a titled column', async () => {
    const { container } = renderTable({ extendable: true });
    fireEvent.click(screen.getByTestId('table-append-row'));
    await waitFor(() => expect(container.querySelectorAll('tbody tr')).toHaveLength(5));
    expect(screen.getByTestId('table-body-row-row-appended-1')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('table-append-column'));
    await waitFor(() =>
      expect(screen.getByRole('columnheader', { name: 'Column 4' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('table-append-column'));
    await waitFor(() =>
      expect(screen.getByRole('columnheader', { name: 'Column 5' })).toBeInTheDocument(),
    );
  });

  it('keeps appending rows into explicit rows and numbers them in sequence', async () => {
    const rows = [{ key: 'a', record: people[0] }];
    const { container } = render(<Table<Person> columns={baseColumns} rows={rows} extendable />);
    fireEvent.click(screen.getByTestId('table-append-row'));
    await waitFor(() => expect(container.querySelectorAll('tbody tr')).toHaveLength(2));
    fireEvent.click(screen.getByTestId('table-append-row'));
    await waitFor(() => expect(container.querySelectorAll('tbody tr')).toHaveLength(3));
    expect(screen.getByTestId('table-body-row-row-appended-2')).toBeInTheDocument();
  });

  it('onAppend callbacks own the shape of what is appended and receive the current rows and columns', async () => {
    const rowOnAppend = vi.fn(() => ({
      key: 'custom-row',
      record: { id: 7, name: 'Custom', role: 'r', age: 1, salary: 0, joined: '' },
    }));
    const columnOnAppend = vi.fn(() => ({ key: 'extra', title: 'Extra', dataIndex: 'role' }));
    renderTable({
      extendable: {
        rows: { onAppend: rowOnAppend },
        columns: { onAppend: columnOnAppend as never },
      },
    });
    fireEvent.click(screen.getByTestId('table-append-row'));
    await waitFor(() =>
      expect(screen.getByTestId('table-body-row-custom-row')).toBeInTheDocument(),
    );
    expect(rowOnAppend).toHaveBeenCalledWith(
      expect.objectContaining({ columns: expect.any(Array), rows: expect.any(Array) }),
    );
    fireEvent.click(screen.getByTestId('table-append-column'));
    await waitFor(() =>
      expect(screen.getByRole('columnheader', { name: 'Extra' })).toBeInTheDocument(),
    );
    expect(columnOnAppend).toHaveBeenCalledTimes(1);
  });
});

describe('Table loading', () => {
  it('skeleton (default) replaces the body rows with placeholders and keeps the header', () => {
    const { container } = renderTable({ loading: true });
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
    expect(screen.queryByText('Ada')).not.toBeInTheDocument();
    const skeleton = container.querySelectorAll('tr.bui-table-skeleton-row');
    // at least two placeholder rows, one cell per column
    expect(skeleton.length).toBeGreaterThanOrEqual(2);
    expect(skeleton[0].querySelectorAll('td')).toHaveLength(3);
    expect(skeleton[0]).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByTestId('table-empty')).not.toBeInTheDocument();
  });

  it('skeleton row count follows the row count and pads for the selection column', () => {
    const { container } = renderTable({ loading: 'skeleton', rowSelection: {} });
    expect(container.querySelectorAll('tr.bui-table-skeleton-row')).toHaveLength(4);
    expect(
      container.querySelector('tr.bui-table-skeleton-row')!.querySelectorAll('td'),
    ).toHaveLength(4);
  });

  it('spinner variant dims the table with an overlay and keeps the rows', () => {
    renderTable({ loading: 'spinner' });
    expect(screen.getByTestId('table-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Ada')).toBeInTheDocument();
  });

  it('loading object chooses the variant and passes text to the spinner', () => {
    renderTable({ loading: { variant: 'spinner', text: 'Crunching' } });
    expect(screen.getByText('Crunching')).toBeInTheDocument();
  });

  it('a falsey loading renders neither', () => {
    const { container } = renderTable({ loading: false });
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(container.querySelector('.bui-table-skeleton-row')).toBeNull();
    expect(screen.getByText('Ada')).toBeInTheDocument();
  });
});

describe('Table virtualization', () => {
  it('renders every row when virtual is off and marks the root', () => {
    renderTable({ virtual: false });
    expect(screen.getByTestId('table-root')).toHaveAttribute('data-virtual-rows', 'false');
  });

  it('virtual rows keep the data-virtual flags and still render rows inside the scroll body', () => {
    const many: Person[] = Array.from({ length: 200 }, (_, i) => ({
      id: i,
      name: `P${i}`,
      role: 'r',
      age: i,
      salary: 0,
      joined: '',
    }));
    const { container } = render(
      <Table<Person>
        columns={baseColumns}
        dataSource={many}
        rowKey="id"
        virtual={{ rows: true, estimateRowHeight: 30, overscan: 2 }}
        scroll={{ y: 300 }}
      />,
    );
    const root = screen.getByTestId('table-root');
    expect(root).toHaveAttribute('data-virtual-rows');
    // happy-dom has no layout so the virtualizer sees a zero-height viewport: it must never render all 200 rows
    expect(container.querySelectorAll('tbody tr[data-row-key]').length).toBeLessThan(200);
  });

  it('virtual.columns is reflected on the root', () => {
    renderTable({ virtual: { columns: true } });
    expect(screen.getByTestId('table-root')).toHaveAttribute('data-virtual-columns', 'true');
  });
});

describe('Table sticky header', () => {
  it('sticky=true pins the header and sets the flag', () => {
    renderTable({ sticky: true });
    expect(screen.getByTestId('table-root')).toHaveAttribute('data-sticky', 'true');
    expect(screen.getByTestId('table-header-wrapper')).toHaveStyle({
      position: 'sticky',
      top: '0px',
    });
  });

  it('sticky offsets and container are honoured', () => {
    const container = document.createElement('div');
    renderTable({
      sticky: { offsetHeader: 12, offsetScroll: 6, getContainer: () => container },
      scroll: { x: 600 },
    });
    expect(screen.getByTestId('table-header-wrapper')).toHaveStyle({ top: '12px' });
    const bar = screen.getByTestId('table-sticky-scrollbar');
    expect(bar).toHaveStyle({ bottom: '6px' });
    expect(bar).toHaveAttribute('data-sticky-container', 'true');
    expect(screen.getByTestId('table-table')).toHaveStyle({ minWidth: '600px' });
  });

  it('scroll.x=true makes the table at least as wide as its container', () => {
    renderTable({ scroll: { x: true } });
    expect(screen.getByTestId('table-table')).toHaveStyle({ minWidth: '100%' });
  });
});

describe('Table appearance variables', () => {
  it('appearance maps to css variables on the root', () => {
    renderTable({
      appearance: {
        headerFill: '#abcdef',
        borderColor: '#123456',
        textSize: 12,
        padding: { top: 4 },
        blockBorder: { radius: 8 },
      },
    });
    const root = screen.getByTestId('table-root');
    expect(root.style.getPropertyValue('--bui-table-header-bg')).toBe('#abcdef');
    expect(root.style.getPropertyValue('--bui-table-border')).toBe('#123456');
    expect(root.style.getPropertyValue('--bui-table-radius')).toBe('8px');
    expect(root).toHaveStyle({ paddingTop: '4px' });
  });

  it('cellAlignment aligns every cell unless the column says otherwise', () => {
    render(
      <Table<Person>
        columns={[
          { key: 'name', dataIndex: 'name', title: 'Name' },
          { key: 'age', dataIndex: 'age', title: 'Age', align: 'center' },
        ]}
        dataSource={[people[0]]}
        rowKey="id"
        appearance={{ cellAlignment: 'right' }}
      />,
    );
    expect(screen.getByTestId('table-body-cell-1-name')).toHaveStyle({ textAlign: 'right' });
    expect(screen.getByTestId('table-body-cell-1-age')).toHaveStyle({ textAlign: 'center' });
  });
});
