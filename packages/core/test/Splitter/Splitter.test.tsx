import '@testing-library/jest-dom';

import {
  DEFAULT_SPLITTER_LABELS,
  Splitter,
  SplitterPanel,
  type SplitterSizes,
} from '@oc-tech/omni-ui-components/Splitter';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ColumnsWithGap,
  ResettableColumns,
  ResizableColumns,
  ResizableStack,
  StaticSplit,
  StaticThreePanels,
  splitterPropsFactory,
} from 'factories/omni-ui-components/Splitter/Splitter.factories';

/** happy-dom lays nothing out: give every element a main size so the splitter has room to share. */
const layout = (width: number, height = 600) => {
  const w = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width);
  const h = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(height);
  return () => (w.mockRestore(), h.mockRestore());
};

const Columns = (props: React.ComponentProps<typeof Splitter>) => (
  <Splitter {...splitterPropsFactory(props)}>
    <SplitterPanel id="list" label="list" defaultSize={200} minSize={100} maxSize={300}>
      List
    </SplitterPanel>
    <SplitterPanel id="main" minSize={300}>
      Main
    </SplitterPanel>
    <SplitterPanel id="side" label="side" defaultSize={250}>
      Side
    </SplitterPanel>
  </Splitter>
);

const handle = (name: string) => screen.getByRole('separator', { name: `Resize ${name}` });
const now = (name: string) => Number(handle(name).getAttribute('aria-valuenow'));

describe('omni-ui-components/Splitter', () => {
  let restore: () => void;
  beforeEach(() => {
    restore = layout(1000);
  });
  afterEach(() => restore());

  it('renders both panels', () => {
    render(
      <Splitter>
        <SplitterPanel>Left</SplitterPanel>
        <SplitterPanel>Right</SplitterPanel>
      </Splitter>,
    );
    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
  });

  it('is static by default: no handles, the panel keeps its CSS basis and no library prop reaches the DOM', () => {
    render(
      <Splitter data-testid="root">
        <SplitterPanel defaultSize="35%" minSize={10} maxSize={20} label="left">
          Left
        </SplitterPanel>
        <SplitterPanel>Right</SplitterPanel>
      </Splitter>,
    );
    expect(screen.queryByRole('separator')).toBeNull();
    const left = screen.getByText('Left');
    expect(left).toHaveStyle({ flexBasis: '35%', flexGrow: '1' });
    expect(left).not.toHaveAttribute('minsize');
    expect(left).not.toHaveAttribute('label');
    expect(screen.getByTestId('root')).toHaveAttribute('data-slot', 'splitter');
  });

  it('resizable: one handle per sized panel, named from its label, with value, limits and orientation', () => {
    render(<Columns />);
    expect(screen.getAllByRole('separator')).toHaveLength(2);
    const list = handle('list');
    expect(list).toHaveAttribute('aria-orientation', 'vertical');
    expect(list).toHaveAttribute('aria-valuenow', '200');
    expect(list).toHaveAttribute('aria-valuemin', '100');
    expect(list).toHaveAttribute('aria-valuemax', '300');
    expect(list).toHaveAttribute('tabindex', '0');
    expect(list).toHaveAttribute('title', DEFAULT_SPLITTER_LABELS.hint);
    expect(screen.getByText('List')).toHaveStyle({ flex: '0 0 200px' });
    expect(screen.getByText('Main')).toHaveStyle({ minWidth: '300px' });
    // list | handle | main | handle | side: each handle faces the flexible panel.
    const order = Array.from(screen.getByText('List').parentElement!.children).map(
      (el) => el.getAttribute('data-slot') ?? '',
    );
    expect(order).toEqual([
      'splitter-panel',
      'splitter-handle',
      'splitter-panel',
      'splitter-handle',
      'splitter-panel',
    ]);
  });

  it('arrow keys step the panel, Home and End go to the limits, other keys do nothing', async () => {
    const onSizesChange = vi.fn();
    render(<Columns onSizesChange={onSizesChange} keyboardStep={10} />);
    handle('list').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(now('list')).toBe(210);
    expect(onSizesChange).toHaveBeenLastCalledWith({ list: 210, side: 250 });
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(now('list')).toBe(190);
    await userEvent.keyboard('{Home}');
    expect(now('list')).toBe(100);
    await userEvent.keyboard('{End}');
    expect(now('list')).toBe(300);
    const calls = onSizesChange.mock.calls.length;
    await userEvent.keyboard('{ArrowUp}a');
    expect(onSizesChange).toHaveBeenCalledTimes(calls);
  });

  it('a handle before its panel grows it leftwards; the room the others leave is the ceiling', async () => {
    render(<Columns />);
    handle('side').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(now('side')).toBe(274);
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(now('side')).toBe(226);
    // 1000 wide, list 200, main keeps 300, two 8px handles: 484 left for the side.
    await userEvent.keyboard('{End}');
    expect(now('side')).toBe(484);
  });

  it('a drag moves the panel with the pointer and reports its start and end', () => {
    const onResizeStart = vi.fn();
    const onResizeEnd = vi.fn();
    const onSizesChange = vi.fn();
    render(
      <Columns
        onResizeStart={onResizeStart}
        onResizeEnd={onResizeEnd}
        onSizesChange={onSizesChange}
      />,
    );
    const list = handle('list');
    fireEvent.pointerMove(list, { clientX: 500 });
    expect(onSizesChange).not.toHaveBeenCalled();
    fireEvent.pointerDown(list, { clientX: 200, pointerId: 1 });
    expect(onResizeStart).toHaveBeenCalledWith('list');
    fireEvent.pointerMove(list, { clientX: 240 });
    expect(now('list')).toBe(240);
    fireEvent.pointerMove(list, { clientX: 900 });
    expect(now('list')).toBe(300);
    fireEvent.pointerUp(list);
    expect(onResizeEnd).toHaveBeenCalledWith('list', { list: 300, side: 250 });
    fireEvent.pointerCancel(list);
    expect(onResizeEnd).toHaveBeenCalledTimes(1);
  });

  it('double-click and Enter put one panel back; a changed resetKey puts all back', async () => {
    const { rerender } = render(<Columns resetKey="a" />);
    handle('list').focus();
    await userEvent.keyboard('{ArrowRight}');
    handle('side').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect([now('list'), now('side')]).toEqual([224, 274]);
    await userEvent.dblClick(handle('list'));
    expect([now('list'), now('side')]).toEqual([200, 274]);
    handle('side').focus();
    await userEvent.keyboard('{Enter}');
    expect(now('side')).toBe(250);
    handle('list').focus();
    await userEvent.keyboard('{ArrowRight}');
    rerender(<Columns resetKey="b" />);
    expect([now('list'), now('side')]).toEqual([200, 250]);
  });

  it('controlled sizes are shown as given and only change through the caller', async () => {
    const onSizesChange = vi.fn();
    const sizes: SplitterSizes = { list: 150, side: 260 };
    const { rerender } = render(<Columns sizes={sizes} onSizesChange={onSizesChange} />);
    expect(now('list')).toBe(150);
    handle('list').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onSizesChange).toHaveBeenCalledWith({ list: 174, side: 260 });
    expect(now('list')).toBe(150);
    rerender(<Columns sizes={{ list: 174, side: 260 }} onSizesChange={onSizesChange} />);
    expect(now('list')).toBe(174);
  });

  it('defaultSizes win over a panel defaultSize; labels and handleProps reach every handle', () => {
    render(
      <Columns
        defaultSizes={{ list: 120 }}
        labels={{ handle: (panel) => `Breite: ${panel}`, hint: 'Ziehen' }}
        handleProps={{ 'data-hit-surface': '', className: 'mine' }}
      />,
    );
    const list = screen.getByRole('separator', { name: 'Breite: list' });
    expect(list).toHaveAttribute('aria-valuenow', '120');
    expect(list).toHaveAttribute('title', 'Ziehen');
    expect(list).toHaveAttribute('data-hit-surface', '');
    expect(list).toHaveClass('mine');
  });

  it('vertical: stacked panels, a horizontal separator moved with ArrowDown and ArrowUp, a panel folds to nothing', async () => {
    render(
      <Splitter resizable orientation="vertical" data-testid="root">
        <SplitterPanel id="top" defaultSize={250}>
          Top
        </SplitterPanel>
        text between
        <SplitterPanel>Rest</SplitterPanel>
      </Splitter>,
    );
    expect(screen.getByTestId('root')).toHaveAttribute('data-orientation', 'vertical');
    expect(screen.getByTestId('root')).toHaveTextContent('text between');
    const top = handle('top');
    expect(top).toHaveAttribute('aria-orientation', 'horizontal');
    top.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(now('top')).toBe(274);
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(now('top')).toBe(226);
    fireEvent.pointerDown(top, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(top, { clientY: 0 });
    expect(now('top')).toBe(126);
    fireEvent.pointerUp(top);
    await userEvent.keyboard('{Home}');
    expect(now('top')).toBe(0);
    expect(screen.getByText('Top')).toHaveStyle({ flex: '0 0 0px' });
  });

  it('a panel without an id is named by its position; every sized panel alone keeps its handle after it', () => {
    render(
      <Splitter resizable>
        <SplitterPanel defaultSize={100}>A</SplitterPanel>
        <SplitterPanel defaultSize={120}>B</SplitterPanel>
      </Splitter>,
    );
    expect(handle('panel-0')).toHaveAttribute('aria-valuenow', '100');
    expect(handle('panel-1')).toHaveAttribute('aria-valuenow', '120');
  });

  it('a root that is not laid out (it measures 0) does not clamp to 0: only the panel limits hold', async () => {
    restore();
    restore = layout(0, 0);
    const onSizesChange = vi.fn();
    render(<Columns onSizesChange={onSizesChange} keyboardStep={10} />);
    expect(now('list')).toBe(200);
    handle('list').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(now('list')).toBe(210);
    expect(onSizesChange).toHaveBeenLastCalledWith({ list: 210, side: 250 });
    await userEvent.keyboard('{End}');
    expect(now('list')).toBe(300);
    await userEvent.keyboard('{Home}');
    expect(now('list')).toBe(100);
    // The side has no maxSize: with no room to measure it grows by its step and is never pushed to 0.
    handle('side').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(now('side')).toBe(260);
  });

  it('a handle never reports an infinite maximum: unmeasured and without maxSize it reports its own size, and End stays there', async () => {
    restore();
    restore = layout(0, 0);
    render(<Columns />);
    const side = handle('side');
    expect(side).toHaveAttribute('aria-valuemax', '250');
    expect(handle('list')).toHaveAttribute('aria-valuemax', '300');
    for (const each of screen.getAllByRole('separator')) {
      expect(each.getAttribute('aria-valuemax')).not.toBe('Infinity');
      expect(Number.isFinite(Number(each.getAttribute('aria-valuemax')))).toBe(true);
    }
    side.focus();
    await userEvent.keyboard('{End}');
    expect(now('side')).toBe(250);
    await userEvent.keyboard('{ArrowLeft}');
    expect(now('side')).toBe(274);
    expect(side).toHaveAttribute('aria-valuemax', '274');
  });

  it('End goes to the real ceiling: the room the others leave when measured, the panel maxSize when that is smaller', async () => {
    render(<Columns />);
    // 1000 wide, list 200, main keeps 300, two 8px handles: 484 left for the side.
    // The room is measured from the root, which exists only after the first render: the first value is the
    // panel's own (its size, or its maxSize), and any later render reports the real ceiling.
    expect(handle('side')).toHaveAttribute('aria-valuemax', '250');
    expect(handle('list')).toHaveAttribute('aria-valuemax', '300');
    handle('side').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(handle('side')).toHaveAttribute('aria-valuemax', '484');
    await userEvent.keyboard('{End}');
    expect(now('side')).toBe(484);
    // The side took the room: the list can now only reach what is left, below its own maxSize.
    expect(handle('list')).toHaveAttribute('aria-valuemax', '200');
    handle('list').focus();
    await userEvent.keyboard('{End}');
    expect(now('list')).toBe(200);
  });

  it('the examples: columns from typed data hold a Panel each and show their size; the reset Button puts all back', async () => {
    const { unmount } = render(<ResizableColumns />);
    expect(screen.getAllByRole('region').map((region) => region.textContent)).toEqual([
      'List180px',
      'Maintakes the rest',
      'Side220px',
    ]);
    expect(handle('List')).toHaveAttribute('aria-valuemin', '160');
    handle('List').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(now('List')).toBe(204);
    expect(screen.getByRole('region', { name: 'List' })).toHaveTextContent('204px');
    fireEvent.pointerDown(handle('Side'), { clientX: 0, pointerId: 1 });
    expect(screen.getByRole('region', { name: 'Side' })).toHaveTextContent('resizing');
    fireEvent.pointerUp(handle('Side'));
    expect(screen.getByRole('region', { name: 'Side' })).toHaveTextContent('220px');
    unmount();
    const reset = render(<ResettableColumns />);
    handle('List').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(now('List')).toBe(204);
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Reset layout' }));
    });
    expect(now('List')).toBe(180);
    expect(screen.getByRole('region', { name: 'List' })).toHaveTextContent('180px');
    reset.unmount();
    const stack = render(<ResizableStack />);
    expect(handle('Top')).toHaveAttribute('aria-orientation', 'horizontal');
    expect(screen.getByRole('region', { name: 'Top' })).toHaveTextContent('90px');
    stack.unmount();
    for (const Example of [StaticSplit, StaticThreePanels, ColumnsWithGap]) {
      const { unmount: done } = render(<Example />);
      expect(document.querySelector('[data-slot="splitter"]')).not.toBeNull();
      done();
    }
  });
});
