import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';

import {
  getDefaultTableRegistry,
  mergeTableRegistry,
  renderActionsField,
  renderAvatarField,
  renderDateField,
  renderFileField,
  renderIconField,
  renderLinkField,
  renderMoneyField,
  renderNumberField,
  renderStringField,
} from '../../src/Table/Table.registry';
import type { TableCellRenderContext, TableColumn } from '../../src/Table/Table.types';

type Rec = Record<string, unknown>;

const ctxFor = (
  value: unknown,
  column: Partial<TableColumn<Rec>> = {},
): TableCellRenderContext<Rec> => {
  const col = { key: 'c', ...column } as TableColumn<Rec>;
  return {
    record: {},
    row: { key: 'r1', cells: { [col.key]: { value } } },
    column: col,
    rowIndex: 0,
    columnIndex: 0,
    registry: getDefaultTableRegistry<Rec>(),
  };
};

// Each call replaces the previous render so `screen` queries never see two copies.
const view = (node: React.ReactNode) => {
  cleanup();
  return render(<div>{node}</div>).container.firstElementChild as HTMLElement;
};

describe('Table.registry field renderers', () => {
  describe('string', () => {
    it('renders primitives as text and empty values as nothing', () => {
      expect(renderStringField(ctxFor('hello'))).toBe('hello');
      expect(renderStringField(ctxFor(42))).toBe('42');
      expect(renderStringField(ctxFor(null))).toBe('');
      expect(renderStringField(ctxFor(undefined))).toBe('');
    });

    it('prefers text, then label, name, title, value from an object payload', () => {
      expect(renderStringField(ctxFor({ label: 'L', name: 'N' }))).toBe('L');
      expect(renderStringField(ctxFor({ text: '', name: 'N' }))).toBe('N');
      expect(renderStringField(ctxFor({ title: 'T' }))).toBe('T');
      expect(renderStringField(ctxFor({ other: 1 }))).toBe('');
    });

    it('passes React elements through untouched and serialises dates as ISO', () => {
      const el = <b>bold</b>;
      expect(renderStringField(ctxFor(el))).toBe(el);
      expect(renderStringField(ctxFor(new Date('2024-01-02T03:04:05.000Z')))).toBe(
        '2024-01-02T03:04:05.000Z',
      );
    });
  });

  describe('number', () => {
    it('formats numbers and numeric strings with grouping', () => {
      expect(renderNumberField(ctxFor(1234567.5))).toBe('1,234,567.5');
      expect(renderNumberField(ctxFor('1,234'))).toBe('1,234');
    });

    it('reads amount/number/value/text from object payloads and honours formatOptions', () => {
      expect(renderNumberField(ctxFor({ amount: 5 }))).toBe('5');
      expect(
        renderNumberField(ctxFor({ number: 0.256, formatOptions: { style: 'percent' } })),
      ).toBe('26%');
    });

    it('regression: formats numeric strings that carry thousands separators', () => {
      expect(renderNumberField(ctxFor('1,234,567.5'))).toBe('1,234,567.5');
      expect(renderMoneyField(ctxFor('$1,234.50'))).toBe('$1,234.50');
    });

    it('falls back to the original value when it is not numeric', () => {
      expect(renderNumberField(ctxFor('n/a'))).toBe('n/a');
      expect(renderNumberField(ctxFor('-'))).toBe('-');
      expect(renderNumberField(ctxFor(Number.NaN))).toBe('NaN');
      expect(renderNumberField(ctxFor(Number.POSITIVE_INFINITY))).toBe('Infinity');
    });
  });

  describe('money', () => {
    it('formats as USD by default with two decimals', () => {
      expect(renderMoneyField(ctxFor(1234.5))).toBe('$1,234.50');
      expect(renderMoneyField(ctxFor('$99'))).toBe('$99.00');
    });

    it('uses the payload currency and format options', () => {
      expect(renderMoneyField(ctxFor({ amount: 10, currency: 'EUR' }))).toBe('€10.00');
      expect(
        renderMoneyField(
          ctxFor({
            amount: 10.4,
            formatOptions: { maximumFractionDigits: 0, minimumFractionDigits: 0 },
          }),
        ),
      ).toBe('$10');
    });

    it('keeps unparsable values as given', () => {
      expect(renderMoneyField(ctxFor('free'))).toBe('free');
    });
  });

  describe('date', () => {
    it('formats ISO date-only strings in local time without a timezone shift', () => {
      expect(renderDateField(ctxFor('2024-03-05'))).toBe('Mar 5, 2024');
    });

    it('accepts Date instances, timestamps and date-time strings', () => {
      expect(renderDateField(ctxFor(new Date(2020, 0, 31)))).toBe('Jan 31, 2020');
      expect(renderDateField(ctxFor(new Date(2021, 5, 1, 12).getTime()))).toBe('Jun 1, 2021');
      expect(renderDateField(ctxFor('2022-07-04T12:00:00'))).toBe('Jul 4, 2022');
    });

    it('reads date/value/text from payload objects and applies formatOptions', () => {
      expect(
        renderDateField(ctxFor({ date: '2024-03-05', formatOptions: { month: 'long' } })),
      ).toBe('March');
      expect(renderDateField(ctxFor({ value: '2024-12-25' }))).toBe('Dec 25, 2024');
    });

    it('falls back to the original text for invalid dates and non-date values', () => {
      expect(renderDateField(ctxFor('not a date'))).toBe('not a date');
      expect(renderDateField(ctxFor(new Date('nope')))).toBe('');
      expect(renderDateField(ctxFor(true))).toBe('true');
    });
  });

  describe('icon', () => {
    it('renders a hidden glyph and a separate visible label when they differ', () => {
      const out = view(renderIconField(ctxFor({ icon: '★', label: 'Starred' })));
      expect(out.querySelector('[aria-hidden="true"]')).toHaveTextContent('★');
      expect(screen.getByText('Starred')).toBeInTheDocument();
    });

    it('does not duplicate the label when it equals the glyph', () => {
      const out = view(renderIconField(ctxFor({ icon: '★', text: '★' })));
      expect(out.querySelectorAll('span > span')).toHaveLength(1);
    });

    it('renders a bare string as the glyph and returns elements as they are', () => {
      expect(
        view(renderIconField(ctxFor('●'))).querySelector('[aria-hidden="true"]'),
      ).toHaveTextContent('●');
      const el = <i data-testid="el" />;
      expect(renderIconField(ctxFor(el))).toBe(el);
      expect(
        view(renderIconField(ctxFor(null))).querySelector('[aria-hidden="true"]'),
      ).toBeEmptyDOMElement();
    });
  });

  describe('avatar', () => {
    it('shows initials from the first two words and the name', () => {
      view(renderAvatarField(ctxFor({ name: 'ada king lovelace' })));
      expect(screen.getByText('AK')).toBeInTheDocument();
      expect(screen.getByText('ada king lovelace')).toBeInTheDocument();
    });

    it('treats a bare string as a name and falls back to ? when empty', () => {
      view(renderAvatarField(ctxFor('Grace Hopper')));
      expect(screen.getByText('GH')).toBeInTheDocument();
      view(renderAvatarField(ctxFor(null)));
      expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('accepts an image url from url/src/avatarUrl/avatar_url', () => {
      // Radix only mounts <img> after load, so assert on the fallback and that no error is thrown.
      view(renderAvatarField(ctxFor({ name: 'X Y', avatar_url: 'https://example.test/a.png' })));
      expect(screen.getByText('XY')).toBeInTheDocument();
    });
  });

  describe('link', () => {
    it('renders an anchor with the label', () => {
      view(renderLinkField(ctxFor({ href: 'https://example.test', label: 'Docs' })));
      const a = screen.getByRole('link', { name: 'Docs' });
      expect(a).toHaveAttribute('href', 'https://example.test');
      expect(a).not.toHaveAttribute('target');
      expect(a).not.toHaveAttribute('rel');
    });

    it('opens _blank links with noreferrer and falls back to the url as label', () => {
      view(renderLinkField(ctxFor({ url: 'https://example.test/x', target: '_blank' })));
      const a = screen.getByRole('link', { name: 'https://example.test/x' });
      expect(a).toHaveAttribute('target', '_blank');
      expect(a).toHaveAttribute('rel', 'noreferrer');
    });

    it('renders plain text when there is no usable href', () => {
      expect(renderLinkField(ctxFor('just text'))).toBe('just text');
      expect(renderLinkField(ctxFor({ href: '   ', label: 'blank' }))).toBe('blank');
    });
  });

  describe('file', () => {
    it('links to the first of href/url/downloadUrl/download_url', () => {
      view(renderFileField(ctxFor({ name: 'report.pdf', download_url: '/f/report.pdf' })));
      expect(screen.getByRole('link', { name: 'report.pdf' })).toHaveAttribute(
        'href',
        '/f/report.pdf',
      );
    });

    it('falls back to the bare name, and to "File" when nameless', () => {
      expect(renderFileField(ctxFor('notes.txt'))).toBe('notes.txt');
      expect(renderFileField(ctxFor(null))).toBe('File');
      expect(renderFileField(ctxFor({ href: '' }))).toBe('File');
    });
  });

  describe('actions', () => {
    it('renders configured actions as buttons wired to onClick', () => {
      const onEdit = vi.fn();
      view(
        renderActionsField(
          ctxFor([
            { key: 'edit', label: 'Edit', onClick: onEdit },
            { id: 'rm', label: 'Remove' },
            'Plain',
          ]),
        ),
      );
      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Plain' })).toBeInTheDocument();
    });

    it('passes element actions through, single elements as-is and other values as text', () => {
      view(
        renderActionsField(
          ctxFor([
            <a key="x" href="#a">
              go
            </a>,
            <span key="keyless">keyless</span>,
          ]),
        ),
      );
      expect(screen.getByRole('link', { name: 'go' })).toBeInTheDocument();
      expect(screen.getByText('keyless')).toBeInTheDocument();
      const el = <u />;
      expect(renderActionsField(ctxFor(el))).toBe(el);
      expect(renderActionsField(ctxFor('text'))).toBe('text');
    });
  });
});

describe('default registry', () => {
  it('registers every row-data field including the text alias', () => {
    const { fields } = getDefaultTableRegistry<Rec>();
    expect(Object.keys(fields).sort()).toEqual([
      'actions',
      'avatar',
      'date',
      'file',
      'icon',
      'link',
      'money',
      'number',
      'string',
      'text',
    ]);
    expect(fields.text).toBe(fields.string);
  });

  it('cell renderer: kind cells render nothing, cell.render wins, then column.render, then String(value)', () => {
    const { renderers } = getDefaultTableRegistry<Rec>();
    const base = ctxFor('v');
    const cellCtx = (cell: Rec, column: Partial<TableColumn<Rec>> = {}) => ({
      ...base,
      row: { key: 'r', cells: { c: cell } },
      column: { key: 'c', ...column } as TableColumn<Rec>,
    });
    expect(renderers.cell(cellCtx({ kind: 'money', value: 5 }))).toBeNull();
    const render = vi.fn((v: unknown) => `custom:${String(v)}`);
    expect(renderers.cell(cellCtx({ value: 7, render }))).toBe('custom:7');
    expect(render.mock.calls[0][1]).toMatchObject({ rowIndex: 0, columnIndex: 0 });
    expect(renderers.cell(cellCtx({ value: 3 }, { render: (v) => `col:${String(v)}` }))).toBe(
      'col:3',
    );
    expect(renderers.cell(cellCtx({ value: 9 }))).toBe('9');
    expect(renderers.cell(cellCtx({}))).toBeNull();
  });

  it('headerCell renderer resolves static and function titles; row renderer ignores function titles', () => {
    const { renderers } = getDefaultTableRegistry<Rec>();
    const base = ctxFor(null);
    const headerCtx = (title: TableColumn<Rec>['title']) => ({
      column: { key: 'c', title } as TableColumn<Rec>,
      columnIndex: 0,
      registry: base.registry,
    });
    expect(renderers.headerCell(headerCtx('Name'))).toBe('Name');
    expect(renderers.headerCell(headerCtx(({ column }) => `fn:${column.key}`))).toBe('fn:c');
    expect(renderers.row({ ...base, row: { key: 'r', title: 'Group' } })).toBe('Group');
    expect(renderers.row({ ...base, row: { key: 'r', title: () => 'x' } })).toBeNull();
  });

  it('empty and loading renderers show their defaults and custom text', () => {
    const { renderers, components } = getDefaultTableRegistry<Rec>();
    view(renderers.empty({}));
    expect(screen.getByText('No data')).toBeInTheDocument();
    view(<components.Empty>Nothing here</components.Empty>);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    view(renderers.loading({}));
    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
    view(renderers.loading({ text: 'Fetching' }));
    expect(screen.getByText('Fetching')).toBeInTheDocument();
  });

  it('pagination item marks the current page, labels prev/next and honours disabled', () => {
    const { PaginationItem } = getDefaultTableRegistry<Rec>().components;
    const onClick = vi.fn();
    render(
      <>
        <PaginationItem page={2} selected onClick={onClick} testId="p2" />
        <PaginationItem kind="prev" selected={false} label="<" onClick={onClick} />
        <PaginationItem kind="next" selected={false} disabled onClick={onClick} />
      </>,
    );
    const current = screen.getByTestId('p2');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveTextContent('2');
    fireEvent.click(current);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Previous page' })).not.toHaveAttribute(
      'aria-current',
    );
    const next = screen.getByRole('button', { name: 'Next page' });
    expect(next).toBeDisabled();
  });

  it('structural components strip internal props and forward the rest to the DOM', () => {
    const { components } = getDefaultTableRegistry<Rec>();
    const internal = { table: {} as never, props: {} as never, registry: {} as never };
    const row = { key: 'r' };
    const { container } = render(
      <table>
        <components.HeaderWrapper {...internal} data-testid="thead">
          <components.HeaderRow {...internal} data-testid="hr">
            <components.HeaderCell
              {...internal}
              column={{ key: 'a' }}
              columnIndex={0}
              data-testid="th"
              className="x"
            >
              A
            </components.HeaderCell>
          </components.HeaderRow>
        </components.HeaderWrapper>
        <components.BodyWrapper {...internal} data-testid="tbody">
          <components.BodyRow {...internal} record={{}} row={row} rowIndex={0} data-testid="tr">
            <components.BodyCell
              {...internal}
              record={{}}
              row={row}
              column={{ key: 'a' }}
              rowIndex={0}
              columnIndex={0}
              value="v"
              data-testid="td"
            >
              v
            </components.BodyCell>
            <components.SelectionCell
              {...internal}
              record={{}}
              row={row}
              column={{ key: 'a' }}
              rowIndex={0}
              columnIndex={-1}
              value
              checked
              onCheckedChange={() => {}}
              data-testid="sel"
            />
            <components.ExpandCell
              {...internal}
              record={{}}
              row={row}
              column={{ key: 'a' }}
              rowIndex={0}
              columnIndex={-2}
              value={false}
              expanded={false}
              onExpandedChange={() => {}}
              data-testid="exp"
            />
          </components.BodyRow>
        </components.BodyWrapper>
        <components.Summary {...internal} data-testid="tfoot" />
      </table>,
    );
    expect(screen.getByTestId('thead').tagName).toBe('THEAD');
    expect(screen.getByTestId('hr').tagName).toBe('TR');
    const th = screen.getByTestId('th');
    expect(th.tagName).toBe('TH');
    expect(th).toHaveAttribute('scope', 'col');
    expect(th).toHaveClass('x');
    expect(screen.getByTestId('tbody').tagName).toBe('TBODY');
    expect(screen.getByTestId('td').tagName).toBe('TD');
    expect(screen.getByTestId('sel').tagName).toBe('TD');
    expect(screen.getByTestId('exp').tagName).toBe('TD');
    expect(screen.getByTestId('tfoot').tagName).toBe('TFOOT');
    // internal props must never leak to the DOM as attributes
    expect(container.innerHTML).not.toMatch(/\bregistry=|\brecord=|\bcolumnindex=|\bchecked=/i);
  });

  it('block components render div/nav wrappers with their class and children', () => {
    const { components } = getDefaultTableRegistry<Rec>();
    const internal = { table: {} as never, props: {} as never, registry: {} as never };
    const ref = React.createRef<HTMLDivElement>();
    render(
      <>
        <components.Root {...internal} ref={ref} data-testid="root">
          R
        </components.Root>
        <components.Title {...internal} data-testid="title">
          T
        </components.Title>
        <components.Content {...internal} data-testid="content" />
        <components.Section {...internal} data-testid="section" />
        <components.Footer {...internal} data-testid="footer">
          F
        </components.Footer>
        <components.PaginationRoot {...internal} className="mine" data-testid="nav">
          P
        </components.PaginationRoot>
      </>,
    );
    const root = screen.getByTestId('root');
    expect(root).toHaveAttribute('data-bui-table-root');
    expect(ref.current).toBe(root);
    expect(screen.getByTestId('title')).toHaveTextContent('T');
    expect(screen.getByTestId('footer')).toHaveTextContent('F');
    const nav = screen.getByTestId('nav');
    expect(nav.tagName).toBe('NAV');
    expect(nav).toHaveClass('bui-table-pagination', 'mine');
  });
});

describe('mergeTableRegistry', () => {
  it('overrides only the supplied keys and keeps the base for the rest', () => {
    const base = getDefaultTableRegistry<Rec>();
    const Custom = () => <div>custom</div>;
    const merged = mergeTableRegistry(base, {
      components: { Empty: Custom } as never,
      fields: { money: () => 'M' },
      editors: { text: () => 'E' },
    });
    expect(merged.components.Empty).toBe(Custom);
    expect(merged.components.Title).toBe(base.components.Title);
    expect(merged.fields.money(ctxFor(1))).toBe('M');
    expect(merged.fields.date).toBe(base.fields.date);
    expect(Object.keys(merged.editors)).toEqual(['text']);
    expect(merged.renderers).toEqual(base.renderers);
    expect(merged.templates).toEqual(base.templates);
  });

  it('returns a fresh registry without mutating the base when no override is given', () => {
    const base = getDefaultTableRegistry<Rec>();
    const merged = mergeTableRegistry(base);
    expect(merged).not.toBe(base);
    expect(merged.components).not.toBe(base.components);
    expect(merged.components).toEqual(base.components);
  });
});
