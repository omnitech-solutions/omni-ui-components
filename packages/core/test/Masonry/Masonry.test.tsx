import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Masonry, type MasonryItem } from '../../src/Masonry/Masonry';

const setWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true });
};
const root = () => screen.getByTestId('m');

describe('omni-ui-components/Masonry', () => {
  beforeEach(() => setWidth(1024));
  afterEach(() => setWidth(1024));

  it('wraps plain children into items laid out in CSS columns with the default gutter', () => {
    render(
      <Masonry data-testid="m">
        <p>One</p>
        <p>Two</p>
      </Masonry>,
    );
    expect(root().style.columnCount).toBe('3');
    expect(root().style.columnGap).toBe('16px');
    expect(root().children).toHaveLength(2);
    expect((root().children[0] as HTMLElement).style.marginBottom).toBe('16px');
  });

  it('renders items, honouring key, height and itemRender with the index', () => {
    const itemRender = vi.fn((item: MasonryItem & { index: number }) => <b>{`${item.index}:${String(item.data)}`}</b>);
    render(
      <Masonry
        data-testid="m"
        items={[
          { key: 'a', data: 'alpha', height: 120 },
          { key: 'b', data: 'beta' },
        ]}
        itemRender={itemRender}
      />,
    );
    expect(screen.getByText('0:alpha')).toBeInTheDocument();
    expect(screen.getByText('1:beta')).toBeInTheDocument();
    expect((root().children[0] as HTMLElement).style.minHeight).toBe('120px');
    expect(itemRender.mock.calls[0][0]).toMatchObject({ key: 'a', index: 0, data: 'alpha' });
  });

  it('renders item children and treats bare nodes in items as children', () => {
    render(<Masonry data-testid="m" items={[{ key: 'a', children: <i>Rich</i> }, 'bare text']} />);
    expect(screen.getByText('Rich')).toBeInTheDocument();
    expect(screen.getByText('bare text')).toBeInTheDocument();
  });

  it('a fixed column count wins, and a count below one is clamped to one', () => {
    const { rerender } = render(<Masonry data-testid="m" columns={5} items={['a']} />);
    expect(root().style.columnCount).toBe('5');
    rerender(<Masonry data-testid="m" columns={0} items={['a']} />);
    expect(root().style.columnCount).toBe('1');
  });

  it.each([
    [500, '1'],
    [700, '2'],
    [900, '4'],
  ])('responsive columns at %ipx resolve to %s', (width, expected) => {
    setWidth(width);
    render(<Masonry data-testid="m" columns={{ xs: 1, sm: 2, md: 4 }} items={['a']} />);
    expect(root().style.columnCount).toBe(expected);
  });

  it('responsive columns fall back to the nearest defined breakpoint, then to 3', () => {
    setWidth(900);
    const { rerender } = render(<Masonry data-testid="m" columns={{ xs: 2 }} items={['a']} />);
    expect(root().style.columnCount).toBe('2');
    rerender(<Masonry data-testid="m" columns={{}} items={['a']} />);
    expect(root().style.columnCount).toBe('3');
    rerender(<Masonry data-testid="m" columns={{ md: 6 }} items={['a']} />);
    setWidth(300);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(root().style.columnCount).toBe('6');
  });

  it('re-resolves columns when the window is resized', () => {
    render(<Masonry data-testid="m" columns={{ xs: 1, md: 3 }} items={['a']} />);
    expect(root().style.columnCount).toBe('3');
    act(() => {
      setWidth(400);
      window.dispatchEvent(new Event('resize'));
    });
    expect(root().style.columnCount).toBe('1');
  });

  it('accepts string gutters, tuples and responsive gutters', () => {
    const { rerender } = render(<Masonry data-testid="m" gutter="2rem" items={['a']} />);
    expect(root().style.columnGap).toBe('2rem');
    expect((root().children[0] as HTMLElement).style.marginBottom).toBe('2rem');

    rerender(<Masonry data-testid="m" gutter={[8, 24]} items={['a']} />);
    expect(root().style.columnGap).toBe('8px');
    expect((root().children[0] as HTMLElement).style.marginBottom).toBe('24px');

    setWidth(900);
    rerender(<Masonry data-testid="m" gutter={{ xs: 4, sm: 10, md: [12, 20] }} items={['a']} />);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(root().style.columnGap).toBe('12px');
    expect((root().children[0] as HTMLElement).style.marginBottom).toBe('20px');
  });

  it.each([
    [900, { xs: 4, sm: 10 }, '10px'],
    [900, { xs: 4 }, '4px'],
    [700, { xs: 4, sm: 10, md: 20 }, '10px'],
    [700, { xs: 4 }, '4px'],
    [300, { xs: 4, sm: 10, md: 20 }, '4px'],
    [300, {}, '0'],
  ])('responsive gutter at %ipx with %j resolves to %s', (width, gutter, expected) => {
    setWidth(width);
    render(<Masonry data-testid="m" gutter={gutter} items={['a']} />);
    expect(root().style.columnGap).toBe(expected);
  });

  it('reports the layout, assigning columns round-robin unless an item pins one', () => {
    const onLayoutChange = vi.fn();
    render(
      <Masonry
        columns={2}
        onLayoutChange={onLayoutChange}
        items={[{ key: 'a', children: 'A' }, { key: 'b', children: 'B', column: 0 }, { key: 'c', children: 'C' }]}
      />,
    );
    expect(onLayoutChange).toHaveBeenCalledWith([
      { key: 'a', column: 0 },
      { key: 'b', column: 0 },
      { key: 'c', column: 0 },
    ]);
  });

  it('reports again when the item count changes', () => {
    const onLayoutChange = vi.fn();
    const { rerender } = render(<Masonry columns={2} onLayoutChange={onLayoutChange} items={['a', 'b']} />);
    expect(onLayoutChange).toHaveBeenLastCalledWith([
      { key: 0, column: 0 },
      { key: 1, column: 1 },
    ]);
    rerender(<Masonry columns={2} onLayoutChange={onLayoutChange} items={['a', 'b', 'c']} />);
    expect(onLayoutChange).toHaveBeenLastCalledWith([
      { key: 0, column: 0 },
      { key: 1, column: 1 },
      { key: 2, column: 0 },
    ]);
  });

  it('merges classNames, rootClassName, className and styles; style prop wins; forwards the ref', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Masonry
        ref={ref}
        data-testid="m"
        items={['a']}
        classNames={{ root: 'r1', item: 'i1' }}
        rootClassName="r2"
        className="r3"
        styles={{ root: { color: 'red', columnCount: 9 }, item: { padding: '3px' } }}
        style={{ columnCount: 2 }}
      />,
    );
    expect(ref.current).toBe(root());
    expect(root()).toHaveClass('r1', 'r2', 'r3');
    expect(root().children[0]).toHaveClass('i1', 'break-inside-avoid');
    expect(root().style.color).toBe('red');
    expect(root().style.columnCount).toBe('2');
    expect((root().children[0] as HTMLElement).style.padding).toBe('3px');
  });

  it('with fresh, remounts the container when the item keys change', () => {
    const { rerender } = render(<Masonry data-testid="m" fresh items={[{ key: 'a', children: 'A' }]} />);
    const first = root();
    rerender(<Masonry data-testid="m" fresh items={[{ key: 'b', children: 'B' }]} />);
    expect(root()).not.toBe(first);

    const stable = render(<Masonry data-testid="s" items={[{ key: 'a', children: 'A' }]} />);
    const before = screen.getByTestId('s');
    stable.rerender(<Masonry data-testid="s" items={[{ key: 'b', children: 'B' }]} />);
    expect(screen.getByTestId('s')).toBe(before);
  });

  it('removes its resize listener on unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<Masonry items={['a']} />);
    unmount();
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function));
    remove.mockRestore();
  });
});
