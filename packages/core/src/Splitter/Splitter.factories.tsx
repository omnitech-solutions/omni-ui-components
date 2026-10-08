import { Button } from '@oc-tech/omni-ui-components/Button';
import { Panel } from '@oc-tech/omni-ui-components/Panel';
import {
  Splitter,
  type SplitterEdge,
  SplitterPanel,
  type SplitterPanelProps,
  type SplitterProps,
  type SplitterSizes,
} from '@oc-tech/omni-ui-components/Splitter';
import { RotateCcw } from 'lucide-react';
import { useState } from 'react';

// The examples below are written exactly as a consumer writes them. The docs "Show code" of each story and the
// Component Overview row are read from this file, so the code shown is the code that runs.

/** Build `<Splitter>` props for tests: a resizable row. */
export const splitterPropsFactory = (overrides: Partial<SplitterProps> = {}): SplitterProps => ({
  resizable: true,
  orientation: 'horizontal',
  ...overrides,
});

/** A column of the layout: the limits a `SplitterPanel` takes, plus the caller's own heading. */
export interface Column extends Pick<SplitterPanelProps, 'defaultSize' | 'minSize' | 'maxSize'> {
  id: string;
  heading: string;
}

/** Three columns: the outer two have a size and limits of their own, the middle one takes the rest. */
export const columns: Column[] = [
  { id: 'list', heading: 'List', defaultSize: 180, minSize: 160, maxSize: 360 },
  { id: 'main', heading: 'Main', minSize: 240 },
  { id: 'side', heading: 'Side', defaultSize: 220, minSize: 200, maxSize: 480 },
];

/** Static: two panels at a CSS basis, no handles. */
export const StaticSplit = () => (
  <Splitter className="h-48">
    <SplitterPanel defaultSize="35%" className="p-4">
      Left panel
    </SplitterPanel>
    <SplitterPanel className="p-4">Right panel</SplitterPanel>
  </Splitter>
);

/** Static: three panels. */
export const StaticThreePanels = () => (
  <Splitter className="h-48">
    <SplitterPanel defaultSize="20%" className="p-4">
      Nav
    </SplitterPanel>
    <SplitterPanel defaultSize="40%" className="p-4">
      Content
    </SplitterPanel>
    <SplitterPanel className="p-4">Inspector</SplitterPanel>
  </Splitter>
);

/** Resizable columns from typed data, a `Panel` in each; the sizes are kept by the caller (controlled). */
export const ResizableColumns = () => {
  const [sizes, setSizes] = useState<SplitterSizes>({ list: 180, side: 220 });
  const [held, setHeld] = useState<string | null>(null);
  return (
    <Splitter
      resizable
      sizes={sizes}
      onSizesChange={(next) => setSizes(next)}
      onResizeStart={(panelId) => setHeld(panelId)}
      onResizeEnd={() => setHeld(null)}
      style={{ height: 220 }}
    >
      {columns.map(({ id, heading, ...limits }) => (
        <SplitterPanel key={id} id={id} label={heading} {...limits} className="flex">
          <Panel
            title={heading}
            meta={held === id ? 'resizing' : id in sizes ? `${sizes[id]}px` : 'takes the rest'}
          />
        </SplitterPanel>
      ))}
    </Splitter>
  );
};

/** Stacked: the top panel has a size and folds to nothing, the other takes the rest. Sizes are kept inside. */
export const ResizableStack = () => {
  const [sizes, setSizes] = useState<SplitterSizes>({ top: 90 });
  return (
    <Splitter
      resizable
      orientation="vertical"
      onSizesChange={(next) => setSizes(next)}
      style={{ height: 320 }}
    >
      <SplitterPanel
        id="top"
        label="Top"
        defaultSize={90}
        minSize={0}
        maxSize={150}
        className="flex"
      >
        <Panel title="Top" meta={`${sizes.top}px`} />
      </SplitterPanel>
      <SplitterPanel id="rest" minSize={60} className="flex">
        <Panel title="Rest" meta="takes the rest" />
      </SplitterPanel>
    </Splitter>
  );
};

/** A changed `resetKey` puts every panel back: here from a library `Button` in a panel's `actions`. */
export const ResettableColumns = () => {
  const [resetKey, setResetKey] = useState(0);
  const [sizes, setSizes] = useState<SplitterSizes>({ list: 180, side: 220 });
  return (
    <Splitter
      resizable
      resetKey={resetKey}
      onSizesChange={(next) => setSizes(next)}
      style={{ height: 220 }}
    >
      {columns.map(({ id, heading, ...limits }) => (
        <SplitterPanel key={id} id={id} label={heading} {...limits} className="flex">
          <Panel
            title={heading}
            meta={id in sizes ? `${sizes[id]}px` : undefined}
            actions={
              id === 'main' ? (
                <Button
                  buttonSize="sm"
                  variant="outline"
                  icon={<RotateCcw />}
                  onClick={() => setResetKey((current) => current + 1)}
                >
                  Reset layout
                </Button>
              ) : undefined
            }
          />
        </SplitterPanel>
      ))}
    </Splitter>
  );
};

/** A panel paints nothing of its own, so an empty one between two `Panel`s is a see-through gap. */
export const ColumnsWithGap = () => (
  <Splitter resizable style={{ height: 220 }}>
    <SplitterPanel id="list" label="List" defaultSize={180} className="flex">
      <Panel title="List" />
    </SplitterPanel>
    <SplitterPanel id="gap" minSize={120} role="img" aria-label="See-through gap" />
    <SplitterPanel id="side" label="Side" defaultSize={220} className="flex">
      <Panel title="Side" />
    </SplitterPanel>
  </Splitter>
);

/** The limits of what the outer edges resize, as `Splitter` takes them, plus the caller's own starting size. */
export interface ExtentLimits extends Pick<SplitterProps, 'minExtent' | 'maxExtent'> {
  defaultExtent: number;
}

/** A card between 280 and 640px wide that starts at 420. */
export const cardWidth: ExtentLimits = { defaultExtent: 420, minExtent: 280, maxExtent: 640 };

/** A card between 120 and 360px tall that starts at 200. */
export const cardHeight: ExtentLimits = { defaultExtent: 200, minExtent: 120, maxExtent: 360 };

/**
 * A card resized from both side edges about its centre. An edge handle resizes nothing itself: it reports the
 * width wanted, and the caller keeps it in state and applies it as the container's style.
 */
export const CardResizedFromBothSides = () => {
  const [width, setWidth] = useState(cardWidth.defaultExtent);
  const [lastEdge, setLastEdge] = useState<SplitterEdge | null>(null);
  const reset = () => {
    setWidth(cardWidth.defaultExtent);
    setLastEdge(null);
  };
  return (
    <div style={{ width, marginInline: 'auto' }}>
      <Splitter
        resizable
        edges={['start', 'end']}
        edgeAnchor="centre"
        extent={width}
        minExtent={cardWidth.minExtent}
        maxExtent={cardWidth.maxExtent}
        onExtentChange={(extent: number, edge: SplitterEdge) => {
          setWidth(extent);
          setLastEdge(edge);
        }}
        onExtentReset={reset}
        style={{ height: 200 }}
      >
        <SplitterPanel id="card" className="flex">
          <Panel
            title="Card"
            meta={lastEdge ? `${width}px, from the ${lastEdge} edge` : `${width}px`}
            actions={
              <Button buttonSize="sm" variant="outline" icon={<RotateCcw />} onClick={reset}>
                Reset width
              </Button>
            }
          />
        </SplitterPanel>
      </Splitter>
    </div>
  );
};

/** Stacked: a card resized from its bottom edge. Its top stays put, so the height changes by the distance dragged. */
export const CardResizedFromBottom = () => {
  const [height, setHeight] = useState(cardHeight.defaultExtent);
  return (
    <div style={{ height }}>
      <Splitter
        resizable
        orientation="vertical"
        edges={['end']}
        extent={height}
        minExtent={cardHeight.minExtent}
        maxExtent={cardHeight.maxExtent}
        onExtentChange={(extent: number) => setHeight(extent)}
        onExtentReset={() => setHeight(cardHeight.defaultExtent)}
      >
        <SplitterPanel id="card" className="flex">
          <Panel title="Card" meta={`${height}px`} />
        </SplitterPanel>
      </Splitter>
    </div>
  );
};
