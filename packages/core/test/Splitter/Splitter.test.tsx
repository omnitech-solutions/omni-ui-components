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
  CardResizedFromBothSides,
  CardResizedFromBottom,
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

const Edged = (props: React.ComponentProps<typeof Splitter>) => (
  <Splitter {...splitterPropsFactory({ edges: ['start', 'end'], extent: 400, ...props })}>
    <SplitterPanel id="body">Body</SplitterPanel>
  </Splitter>
);
const edge = (side: 'left' | 'right' | 'top' | 'bottom') =>
  screen.getByRole('separator', { name: `Resize from the ${side} edge` });
const slots = (root: HTMLElement) =>
  Array.from(root.children).map((el) => el.getAttribute('data-slot') ?? '');

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

  describe('outer edges', () => {
    it('an edge handle is drawn only for a listed edge, and only when resizable', () => {
      const { rerender } = render(<Edged data-testid="root" edges={['end']} />);
      expect(slots(screen.getByTestId('root'))).toEqual(['splitter-panel', 'splitter-edge']);
      expect(screen.getByRole('separator')).toHaveAttribute('data-edge', 'end');
      rerender(<Edged data-testid="root" edges={['start']} />);
      expect(slots(screen.getByTestId('root'))).toEqual(['splitter-edge', 'splitter-panel']);
      expect(screen.getByRole('separator')).toHaveAttribute('data-edge', 'start');
      rerender(<Edged data-testid="root" />);
      expect(slots(screen.getByTestId('root'))).toEqual([
        'splitter-edge',
        'splitter-panel',
        'splitter-edge',
      ]);
      rerender(<Edged data-testid="root" edges={[]} />);
      expect(screen.queryByRole('separator')).toBeNull();
      rerender(<Edged data-testid="root" edges={undefined} />);
      expect(screen.queryByRole('separator')).toBeNull();
      rerender(<Edged data-testid="root" resizable={false} />);
      expect(screen.queryByRole('separator')).toBeNull();
      expect(document.querySelector('[data-slot="splitter-edge"]')).toBeNull();
    });

    it('edge handles sit outside the panel handles, which keep their own names and values', () => {
      render(<Columns data-testid="root" edges={['start', 'end']} extent={1000} />);
      expect(slots(screen.getByTestId('root'))).toEqual([
        'splitter-edge',
        'splitter-panel',
        'splitter-handle',
        'splitter-panel',
        'splitter-handle',
        'splitter-panel',
        'splitter-edge',
      ]);
      expect(now('list')).toBe(200);
      expect(edge('left')).toHaveAttribute('aria-valuenow', '1000');
    });

    it('is a focusable separator named by its edge, with the extent as its value and its limits', () => {
      const { rerender } = render(<Edged minExtent={300} maxExtent={640} />);
      for (const [side, name] of [
        ['left', 'start'],
        ['right', 'end'],
      ] as const) {
        const each = edge(side);
        expect(each).toHaveAttribute('data-slot', 'splitter-edge');
        expect(each).toHaveAttribute('data-edge', name);
        expect(each).toHaveAttribute('aria-orientation', 'vertical');
        expect(each).toHaveAttribute('aria-valuenow', '400');
        expect(each).toHaveAttribute('aria-valuemin', '300');
        expect(each).toHaveAttribute('aria-valuemax', '640');
        expect(each).toHaveAttribute('tabindex', '0');
        expect(each).toHaveAttribute('title', DEFAULT_SPLITTER_LABELS.hint);
      }
      rerender(<Edged orientation="vertical" />);
      expect(edge('top')).toHaveAttribute('data-edge', 'start');
      expect(edge('bottom')).toHaveAttribute('data-edge', 'end');
      expect(edge('bottom')).toHaveAttribute('aria-orientation', 'horizontal');
      expect(edge('bottom')).toHaveAttribute('aria-valuemin', '0');
      rerender(<Edged labels={{ edge: (which, orientation) => `Rand ${which} ${orientation}` }} />);
      expect(screen.getByRole('separator', { name: 'Rand start horizontal' })).toBeInTheDocument();
      expect(screen.getByRole('separator', { name: 'Rand end horizontal' })).toBeInTheDocument();
      expect(DEFAULT_SPLITTER_LABELS.edge('end', 'vertical')).toBe('Resize from the bottom edge');
    });

    it('never reports an infinite maximum: without maxExtent it reports the extent, or minExtent when that is larger', () => {
      const { rerender } = render(<Edged />);
      expect(edge('right')).toHaveAttribute('aria-valuemax', '400');
      rerender(<Edged extent={100} minExtent={300} />);
      expect(edge('right')).toHaveAttribute('aria-valuemax', '300');
      for (const each of screen.getAllByRole('separator'))
        expect(Number.isFinite(Number(each.getAttribute('aria-valuemax')))).toBe(true);
    });

    it('opposite anchor: a drag asks for the extent plus the distance moved outwards, in screen coordinates', () => {
      const onExtentChange = vi.fn();
      const onSizesChange = vi.fn();
      render(<Edged onExtentChange={onExtentChange} onSizesChange={onSizesChange} />);
      const right = edge('right');
      fireEvent.pointerMove(right, { screenX: 900 });
      expect(onExtentChange).not.toHaveBeenCalled();
      // clientX is not what is read: the container may move under the pointer.
      fireEvent.pointerDown(right, { screenX: 100, clientX: 7, pointerId: 1 });
      fireEvent.pointerMove(right, { screenX: 140, clientX: 7 });
      expect(onExtentChange).toHaveBeenLastCalledWith(440, 'end');
      fireEvent.pointerMove(right, { screenX: 70 });
      expect(onExtentChange).toHaveBeenLastCalledWith(370, 'end');
      fireEvent.pointerUp(right);
      fireEvent.pointerMove(right, { screenX: 500 });
      expect(onExtentChange).toHaveBeenCalledTimes(2);

      const left = edge('left');
      fireEvent.pointerDown(left, { screenX: 100, pointerId: 2 });
      fireEvent.pointerMove(left, { screenX: 60 });
      expect(onExtentChange).toHaveBeenLastCalledWith(440, 'start');
      fireEvent.pointerMove(left, { screenX: 130 });
      expect(onExtentChange).toHaveBeenLastCalledWith(370, 'start');
      fireEvent.pointerCancel(left);
      // An edge resizes no panel.
      expect(onSizesChange).not.toHaveBeenCalled();
    });

    it('centre anchor: a drag asks for twice the distance moved, from either edge', () => {
      const onExtentChange = vi.fn();
      render(<Edged edgeAnchor="centre" onExtentChange={onExtentChange} />);
      fireEvent.pointerDown(edge('right'), { screenX: 100, pointerId: 1 });
      fireEvent.pointerMove(edge('right'), { screenX: 140 });
      expect(onExtentChange).toHaveBeenLastCalledWith(480, 'end');
      fireEvent.pointerUp(edge('right'));
      fireEvent.pointerDown(edge('left'), { screenX: 100, pointerId: 2 });
      fireEvent.pointerMove(edge('left'), { screenX: 60 });
      expect(onExtentChange).toHaveBeenLastCalledWith(480, 'start');
      fireEvent.pointerMove(edge('left'), { screenX: 125 });
      expect(onExtentChange).toHaveBeenLastCalledWith(350, 'start');
      fireEvent.pointerUp(edge('left'));
    });

    it('vertical: a drag reads screenY, with both anchors', () => {
      const onExtentChange = vi.fn();
      const { rerender } = render(<Edged orientation="vertical" onExtentChange={onExtentChange} />);
      fireEvent.pointerDown(edge('bottom'), { screenY: 50, screenX: 50, pointerId: 1 });
      fireEvent.pointerMove(edge('bottom'), { screenY: 80, screenX: 500 });
      expect(onExtentChange).toHaveBeenLastCalledWith(430, 'end');
      fireEvent.pointerUp(edge('bottom'));
      fireEvent.pointerDown(edge('top'), { screenY: 50, pointerId: 2 });
      fireEvent.pointerMove(edge('top'), { screenY: 20 });
      expect(onExtentChange).toHaveBeenLastCalledWith(430, 'start');
      fireEvent.pointerUp(edge('top'));
      rerender(
        <Edged orientation="vertical" edgeAnchor="centre" onExtentChange={onExtentChange} />,
      );
      fireEvent.pointerDown(edge('bottom'), { screenY: 50, pointerId: 3 });
      fireEvent.pointerMove(edge('bottom'), { screenY: 80 });
      expect(onExtentChange).toHaveBeenLastCalledWith(460, 'end');
      fireEvent.pointerUp(edge('bottom'));
    });

    it('a drag and a key never ask for less than minExtent or more than maxExtent', async () => {
      const onExtentChange = vi.fn();
      render(
        <Edged minExtent={390} maxExtent={410} keyboardStep={24} onExtentChange={onExtentChange} />,
      );
      const right = edge('right');
      fireEvent.pointerDown(right, { screenX: 100, pointerId: 1 });
      fireEvent.pointerMove(right, { screenX: 900 });
      expect(onExtentChange).toHaveBeenLastCalledWith(410, 'end');
      fireEvent.pointerMove(right, { screenX: -900 });
      expect(onExtentChange).toHaveBeenLastCalledWith(390, 'end');
      fireEvent.pointerUp(right);
      right.focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(onExtentChange).toHaveBeenLastCalledWith(410, 'end');
      await userEvent.keyboard('{ArrowLeft}');
      expect(onExtentChange).toHaveBeenLastCalledWith(390, 'end');
      edge('left').focus();
      await userEvent.keyboard('{ArrowLeft}');
      expect(onExtentChange).toHaveBeenLastCalledWith(410, 'start');
    });

    it('horizontal keys: the end edge grows on ArrowRight, the start edge on ArrowLeft; other keys do nothing', async () => {
      const onExtentChange = vi.fn();
      render(<Edged keyboardStep={10} onExtentChange={onExtentChange} />);
      edge('right').focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(onExtentChange).toHaveBeenLastCalledWith(410, 'end');
      await userEvent.keyboard('{ArrowLeft}');
      expect(onExtentChange).toHaveBeenLastCalledWith(390, 'end');
      edge('left').focus();
      await userEvent.keyboard('{ArrowLeft}');
      expect(onExtentChange).toHaveBeenLastCalledWith(410, 'start');
      await userEvent.keyboard('{ArrowRight}');
      expect(onExtentChange).toHaveBeenLastCalledWith(390, 'start');
      expect(onExtentChange).toHaveBeenCalledTimes(4);
      await userEvent.keyboard('{ArrowUp}{ArrowDown}{Home}{End}a');
      expect(onExtentChange).toHaveBeenCalledTimes(4);
    });

    it('vertical keys: the end edge grows on ArrowDown, the start edge on ArrowUp; the default step is 24', async () => {
      const onExtentChange = vi.fn();
      render(<Edged orientation="vertical" onExtentChange={onExtentChange} />);
      edge('bottom').focus();
      await userEvent.keyboard('{ArrowDown}');
      expect(onExtentChange).toHaveBeenLastCalledWith(424, 'end');
      await userEvent.keyboard('{ArrowUp}');
      expect(onExtentChange).toHaveBeenLastCalledWith(376, 'end');
      edge('top').focus();
      await userEvent.keyboard('{ArrowUp}');
      expect(onExtentChange).toHaveBeenLastCalledWith(424, 'start');
      await userEvent.keyboard('{ArrowDown}');
      expect(onExtentChange).toHaveBeenLastCalledWith(376, 'start');
      expect(onExtentChange).toHaveBeenCalledTimes(4);
      await userEvent.keyboard('{ArrowLeft}{ArrowRight}');
      expect(onExtentChange).toHaveBeenCalledTimes(4);
    });

    it('centre anchor: an arrow key asks for twice the step', async () => {
      const onExtentChange = vi.fn();
      render(<Edged edgeAnchor="centre" keyboardStep={10} onExtentChange={onExtentChange} />);
      edge('right').focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(onExtentChange).toHaveBeenLastCalledWith(420, 'end');
      edge('left').focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(onExtentChange).toHaveBeenLastCalledWith(380, 'start');
    });

    it('Enter and double-click ask for a reset with the edge, and for no size', async () => {
      const onExtentReset = vi.fn();
      const onExtentChange = vi.fn();
      render(<Edged onExtentReset={onExtentReset} onExtentChange={onExtentChange} />);
      edge('left').focus();
      await userEvent.keyboard('{Enter}');
      expect(onExtentReset).toHaveBeenLastCalledWith('start');
      await userEvent.dblClick(edge('right'));
      expect(onExtentReset).toHaveBeenLastCalledWith('end');
      expect(onExtentReset).toHaveBeenCalledTimes(2);
      expect(onExtentChange).not.toHaveBeenCalled();
    });

    it('with no callbacks a drag, a key, Enter and a double-click do nothing and do not throw', async () => {
      render(<Edged />);
      const right = edge('right');
      fireEvent.pointerDown(right, { screenX: 100, pointerId: 1 });
      fireEvent.pointerMove(right, { screenX: 140 });
      fireEvent.pointerUp(right);
      right.focus();
      await userEvent.keyboard('{ArrowRight}{Enter}');
      await userEvent.dblClick(right);
      expect(right).toHaveAttribute('aria-valuenow', '400');
    });

    it('a held edge reports its start and end with the id edge:start or edge:end, once', () => {
      const onResizeStart = vi.fn();
      const onResizeEnd = vi.fn();
      render(
        <Columns
          edges={['start', 'end']}
          extent={1000}
          onResizeStart={onResizeStart}
          onResizeEnd={onResizeEnd}
        />,
      );
      fireEvent.pointerUp(edge('left'));
      expect(onResizeEnd).not.toHaveBeenCalled();
      fireEvent.pointerDown(edge('left'), { screenX: 100, pointerId: 1 });
      expect(onResizeStart).toHaveBeenLastCalledWith('edge:start');
      fireEvent.pointerUp(edge('left'));
      expect(onResizeEnd).toHaveBeenLastCalledWith('edge:start', { list: 200, side: 250 });
      fireEvent.pointerCancel(edge('left'));
      expect(onResizeEnd).toHaveBeenCalledTimes(1);
      fireEvent.pointerDown(edge('right'), { screenX: 100, pointerId: 2 });
      expect(onResizeStart).toHaveBeenLastCalledWith('edge:end');
      fireEvent.pointerCancel(edge('right'));
      expect(onResizeEnd).toHaveBeenLastCalledWith('edge:end', { list: 200, side: 250 });
      expect(onResizeStart).toHaveBeenCalledTimes(2);
      expect(onResizeEnd).toHaveBeenCalledTimes(2);
    });

    it('handleProps reach the edge handles too', () => {
      render(
        <Edged
          handleProps={{ 'data-hit-surface': '', className: 'mine', style: { opacity: 0.5 } }}
        />,
      );
      for (const each of [edge('left'), edge('right')]) {
        expect(each).toHaveAttribute('data-hit-surface', '');
        expect(each).toHaveClass('mine');
        expect(each).toHaveStyle({ opacity: '0.5' });
        expect(each).toHaveAttribute('data-slot', 'splitter-edge');
      }
    });

    it('the extent prop is what a drag and a key start from; a new one is shown and used', async () => {
      const width = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(520);
      const onExtentChange = vi.fn();
      const { rerender } = render(<Edged extent={400} onExtentChange={onExtentChange} />);
      edge('right').focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(onExtentChange).toHaveBeenLastCalledWith(424, 'end');
      // The caller did not apply it: the handle still shows what it was given.
      expect(edge('right')).toHaveAttribute('aria-valuenow', '400');
      rerender(<Edged extent={424} onExtentChange={onExtentChange} />);
      expect(edge('right')).toHaveAttribute('aria-valuenow', '424');
      await userEvent.keyboard('{ArrowRight}');
      expect(onExtentChange).toHaveBeenLastCalledWith(448, 'end');
      width.mockRestore();
    });

    it('without extent the splitter measures itself: its own width, or its height when stacked', async () => {
      const width = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(520);
      const height = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(310);
      const onExtentChange = vi.fn();
      const { rerender } = render(<Edged extent={undefined} onExtentChange={onExtentChange} />);
      edge('right').focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(onExtentChange).toHaveBeenLastCalledWith(544, 'end');
      fireEvent.pointerDown(edge('left'), { screenX: 100, pointerId: 1 });
      fireEvent.pointerMove(edge('left'), { screenX: 90 });
      expect(onExtentChange).toHaveBeenLastCalledWith(530, 'start');
      fireEvent.pointerUp(edge('left'));
      rerender(<Edged extent={undefined} onExtentChange={onExtentChange} />);
      expect(edge('right')).toHaveAttribute('aria-valuenow', '520');
      expect(edge('right')).toHaveAttribute('aria-valuemax', '520');
      rerender(<Edged extent={undefined} orientation="vertical" onExtentChange={onExtentChange} />);
      expect(edge('bottom')).toHaveAttribute('aria-valuenow', '310');
      edge('bottom').focus();
      await userEvent.keyboard('{ArrowDown}');
      expect(onExtentChange).toHaveBeenLastCalledWith(334, 'end');
      width.mockRestore();
      height.mockRestore();
    });

    it('the examples: a card keeps its width from both side edges within its limits and is put back; a stacked one grows from its bottom', async () => {
      const { unmount } = render(<CardResizedFromBothSides />);
      const container = document.querySelector('[data-slot="splitter"]')!.parentElement!;
      expect(container).toHaveStyle({ width: '420px' });
      expect(screen.getByRole('region', { name: 'Card' })).toHaveTextContent('420px');
      expect(edge('right')).toHaveAttribute('aria-valuemin', '280');
      expect(edge('right')).toHaveAttribute('aria-valuemax', '640');
      edge('right').focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(container).toHaveStyle({ width: '468px' });
      expect(edge('left')).toHaveAttribute('aria-valuenow', '468');
      expect(screen.getByRole('region', { name: 'Card' })).toHaveTextContent(
        '468px, from the end edge',
      );
      fireEvent.pointerDown(edge('left'), { screenX: 500, pointerId: 1 });
      fireEvent.pointerMove(edge('left'), { screenX: 0 });
      expect(container).toHaveStyle({ width: '640px' });
      fireEvent.pointerMove(edge('left'), { screenX: 900 });
      expect(container).toHaveStyle({ width: '280px' });
      fireEvent.pointerUp(edge('left'));
      expect(screen.getByRole('region', { name: 'Card' })).toHaveTextContent(
        '280px, from the start edge',
      );
      await userEvent.dblClick(edge('left'));
      expect(container).toHaveStyle({ width: '420px' });
      edge('left').focus();
      await userEvent.keyboard('{ArrowLeft}');
      expect(container).toHaveStyle({ width: '468px' });
      await userEvent.click(screen.getByRole('button', { name: 'Reset width' }));
      expect(container).toHaveStyle({ width: '420px' });
      expect(screen.getByRole('region', { name: 'Card' })).not.toHaveTextContent('from the');
      unmount();

      render(<CardResizedFromBottom />);
      const stack = document.querySelector('[data-slot="splitter"]')!.parentElement!;
      expect(screen.getAllByRole('separator')).toHaveLength(1);
      expect(stack).toHaveStyle({ height: '200px' });
      edge('bottom').focus();
      await userEvent.keyboard('{ArrowDown}');
      expect(stack).toHaveStyle({ height: '224px' });
      fireEvent.pointerDown(edge('bottom'), { screenY: 0, pointerId: 1 });
      fireEvent.pointerMove(edge('bottom'), { screenY: 900 });
      expect(stack).toHaveStyle({ height: '360px' });
      fireEvent.pointerUp(edge('bottom'));
      await userEvent.keyboard('{Enter}');
      expect(stack).toHaveStyle({ height: '200px' });
      expect(screen.getByRole('region', { name: 'Card' })).toHaveTextContent('200px');
    });
  });
});
