import { render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useTableRefHandle } from '../../../src/Table/hooks/useTableRefHandle';
import type { TableRef } from '../../../src/Table/Table.types';

type Setup = {
  enableVirtualRows?: boolean;
  keys?: string[];
  withScroll?: boolean;
  scrollEl?: Partial<HTMLDivElement> | null;
};

const setup = ({ enableVirtualRows = false, keys = ['a', 'b', 'c'], scrollEl }: Setup = {}) => {
  const ref = React.createRef<TableRef>();
  const scrollToIndex = vi.fn();
  const root = document.createElement('div');
  keys.forEach((key, index) => {
    const row = document.createElement('div');
    row.setAttribute('data-row-key', key);
    Object.defineProperty(row, 'offsetTop', { value: (index + 1) * 40 });
    root.appendChild(row);
  });
  const scroll =
    scrollEl === undefined ? ({ scrollTo: vi.fn(), scrollTop: 0 } as never) : (scrollEl as never);
  const visibleRows = keys.map((key) => ({ original: { key } })) as never;
  function Probe() {
    useTableRefHandle({
      ref,
      rootRef: { current: root },
      scrollRef: { current: scroll },
      visibleRows,
      enableVirtualRows,
      rowVirtualizer: { scrollToIndex } as never,
    });
    return null;
  }
  render(<Probe />);
  return {
    ref,
    scroll: scroll as { scrollTo?: ReturnType<typeof vi.fn>; scrollTop: number },
    root,
    scrollToIndex,
  };
};

describe('useTableRefHandle', () => {
  it('exposes the root element', () => {
    const { ref, root } = setup();
    expect(ref.current?.nativeElement).toBe(root);
  });

  it('scrolls to an absolute top via scrollTo, even for top 0', () => {
    const { ref, scroll } = setup();
    ref.current?.scrollTo({ top: 120 });
    expect(scroll.scrollTo).toHaveBeenCalledWith({ top: 120 });
    ref.current?.scrollTo({ top: 0 });
    expect(scroll.scrollTo).toHaveBeenLastCalledWith({ top: 0 });
  });

  it('falls back to scrollTop when the container has no scrollTo', () => {
    const { ref, scroll } = setup({ scrollEl: { scrollTop: 5 } });
    ref.current?.scrollTo({ top: 77 });
    expect(scroll.scrollTop).toBe(77);
  });

  it('ignores a top scroll when there is no container', () => {
    const { ref } = setup({ scrollEl: null });
    expect(() => ref.current?.scrollTo({ top: 10 })).not.toThrow();
  });

  it('scrolls a plain row into view by index, minus the offset', () => {
    const { ref, scroll } = setup({ scrollEl: { scrollTop: 0 } });
    ref.current?.scrollTo({ index: 1, offset: 10 });
    expect(scroll.scrollTop).toBe(70);
  });

  it('scrolls a plain row into view by key', () => {
    const { ref, scroll } = setup({ scrollEl: { scrollTop: 0 } });
    ref.current?.scrollTo({ key: 'c' });
    expect(scroll.scrollTop).toBe(120);
  });

  it('does nothing for an unknown key, a missing target or an out-of-range negative index', () => {
    const { ref, scroll, scrollToIndex } = setup({ scrollEl: { scrollTop: 9 } });
    ref.current?.scrollTo({ key: 'zzz' });
    ref.current?.scrollTo({});
    ref.current?.scrollTo({ index: -1 });
    expect(scroll.scrollTop).toBe(9);
    expect(scrollToIndex).not.toHaveBeenCalled();
  });

  it('leaves the scroll position alone when the row element is missing', () => {
    const { ref, scroll, root } = setup({ scrollEl: { scrollTop: 9 } });
    root.innerHTML = '';
    ref.current?.scrollTo({ index: 0 });
    expect(scroll.scrollTop).toBe(9);
  });

  it('delegates to the virtualizer when rows are virtual, mapping nearest to auto', () => {
    const { ref, scrollToIndex } = setup({ enableVirtualRows: true });
    ref.current?.scrollTo({ index: 2 });
    expect(scrollToIndex).toHaveBeenLastCalledWith(2, { align: 'auto' });
    ref.current?.scrollTo({ key: 'b', align: 'center' });
    expect(scrollToIndex).toHaveBeenLastCalledWith(1, { align: 'center' });
  });
});
