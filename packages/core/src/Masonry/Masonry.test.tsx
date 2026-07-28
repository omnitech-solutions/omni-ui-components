import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Masonry } from './Masonry';

describe('Masonry', () => {
  it('renders items in the configured number of columns and applies the gutter', () => {
    render(
      <Masonry columns={4} gutter={20} items={[{ key: 'a', children: 'Alpha' }, { key: 'b', children: 'Beta' }]} />,
    );

    const root = screen.getByText('Alpha').parentElement;
    expect(root).toHaveStyle({ columnCount: '4', columnGap: '20px' });
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('renders data through itemRender and supports semantic styles', () => {
    render(
      <Masonry
        items={[{ key: 'a', data: 'Alpha' }]}
        itemRender={(item) => <span>{item.data}</span>}
        classNames={{ root: 'masonry-root', item: 'masonry-item' }}
        styles={{ item: { color: 'red' } }}
      />,
    );

    const renderedItem = screen.getByText('Alpha').parentElement;
    expect(renderedItem).toHaveClass('masonry-item');
    expect(renderedItem).toHaveStyle({ color: 'red' });
    expect(renderedItem?.parentElement).toHaveClass('masonry-root');
  });

  it('reports the calculated column for each item', async () => {
    const onLayoutChange = vi.fn();
    render(<Masonry columns={2} items={['One', 'Two', 'Three']} onLayoutChange={onLayoutChange} />);

    await waitFor(() => expect(onLayoutChange).toHaveBeenCalledWith([
      { key: 0, column: 0 },
      { key: 1, column: 1 },
      { key: 2, column: 0 },
    ]));
  });
});
