import { Splitter, type SplitterProps } from '@oc-tech/omni-ui-components/Splitter';
import type { Meta, StoryObj } from '@storybook/react';
import {
  CardResizedFromBothSides,
  CardResizedFromBottom,
  ColumnsWiderThanTheirContainer,
  ColumnsWithGap,
  ResettableColumns,
  ResizableColumns,
  ResizableStack,
  StaticSplit,
  StaticThreePanels,
} from 'factories/omni-ui-components/Splitter/Splitter.factories';
import type * as React from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { exampleDocs } from 'storybook-helpers/internal/support/exampleDocs';
import factories from './Splitter.factories.tsx?raw';

const meta: Meta<SplitterProps> = {
  title: 'omni-ui-components/Splitter',
  component: Splitter as unknown as React.ComponentType<SplitterProps>,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      description: {
        component:
          "<primary>Split-panel layout</primary>. Static by default. With `resizable`, a panel that has a numeric `defaultSize` (px) gets a handle: drag it, or focus it and use the arrow keys, Home and End; double-click or Enter puts that panel back, and a changed `resetKey` puts every panel back. A panel without a size takes the room that is left. Sizes are px by panel `id`, controlled with `sizes` or kept inside from `defaultSizes`; <primary>onSizesChange(sizes)</primary> fires either way, <primary>onResizeStart(panelId)</primary> and <primary>onResizeEnd(panelId, sizes)</primary> report a held handle. `minSize` and `maxSize` bound a panel, `handleProps` reaches every handle, and the handle name comes from `labels.handle(panelLabel)`. A panel paints nothing of its own, so an empty one is a see-through gap. It reuses the library's `useControllableState` for its sizes and draws no surface itself: each `SplitterPanel` is meant to hold a `Panel` (or any other component), which brings the heading, border and scrolling. `edges` (with `resizable`) adds a handle at the `start` and / or `end` outer edge, slot `splitter-edge`. An edge handle resizes no panel: it reports the size wanted for whatever holds the splitter through <primary>onExtentChange(extent, edge)</primary> and the caller applies it, for example as the width of the container. `extent` is the current size (the splitter's own measured size when absent), `minExtent` and `maxExtent` bound it, and `edgeAnchor` says how the container grows: `opposite` (the far edge stays put, the size changes by the distance moved) or `centre` (it grows about its centre, the size changes by twice the distance). Arrow keys move an edge by `keyboardStep`, double-click or Enter calls <primary>onExtentReset(edge)</primary>, `onResizeStart` and `onResizeEnd` report it with the id `edge:start` or `edge:end`, and its name comes from `labels.edge(edge, orientation)`. The resizable stories below show their whole code: a `Column` type that extends the `SplitterPanel` limits, the typed data, the state and the callbacks.",
      },
    },
  },
  argTypes: {
    resizable: { control: false, description: 'Draw handles and keep sizes.' },
    orientation: { control: false, description: '`horizontal` (default) or `vertical`.' },
    sizes: { control: false, description: 'Controlled sizes in px, by panel `id`.' },
    defaultSizes: { control: false, description: 'Starting sizes in px, by panel `id`.' },
    onSizesChange: { control: false, description: '`(sizes: SplitterSizes) => void`.' },
    onResizeStart: { control: false, description: '`(panelId: string) => void`.' },
    onResizeEnd: {
      control: false,
      description: '`(panelId: string, sizes: SplitterSizes) => void`.',
    },
    resetKey: { control: false, description: 'Every panel goes back when this changes.' },
    keyboardStep: { control: false, description: 'Px per arrow key press (24).' },
    edges: {
      control: false,
      description: 'Outer edges that get a handle: `start`, `end`. Needs `resizable`.',
    },
    extent: {
      control: false,
      description: 'Current size in px of what the edges resize. Measured when absent.',
    },
    minExtent: { control: false, description: 'Smallest size an edge asks for (0).' },
    maxExtent: { control: false, description: 'Largest size an edge asks for.' },
    edgeAnchor: { control: false, description: '`opposite` (default) or `centre`.' },
    onExtentChange: {
      control: false,
      description: '`(extent: number, edge: SplitterEdge) => void`.',
    },
    onExtentReset: { control: false, description: '`(edge: SplitterEdge) => void`.' },
  },
};
export default meta;

type Story = StoryObj<SplitterProps>;

export const Default: Story = {
  render: () => <StaticSplit />,
  parameters: exampleDocs(factories, 'StaticSplit'),
};

export const ThreePanels: Story = {
  render: () => <StaticThreePanels />,
  parameters: exampleDocs(factories, 'StaticThreePanels'),
};

/** Controlled sizes: an arrow key steps the list by 24px and its `Panel` shows the new size; Enter puts it back. */
export const Draggable: Story = {
  render: () => <ResizableColumns />,
  parameters: exampleDocs(factories, 'ResizableColumns'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'List' })).toBeVisible();
    const handle = canvas.getByRole('separator', { name: 'Resize List' });
    handle.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(handle).toHaveAttribute('aria-valuenow', '204');
    await expect(canvas.getByText('204px')).toBeVisible();
    await userEvent.keyboard('{Enter}');
    await expect(handle).toHaveAttribute('aria-valuenow', '180');
    await userEvent.keyboard('{Home}');
    await expect(handle).toHaveAttribute('aria-valuenow', '160');
  },
};

export const Vertical: Story = {
  render: () => <ResizableStack />,
  parameters: exampleDocs(factories, 'ResizableStack'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('separator', { name: 'Resize Top' });
    await expect(handle).toHaveAttribute('aria-orientation', 'horizontal');
    handle.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByText('114px')).toBeVisible();
  },
};

/** The `Button` in the middle panel's `actions` changes `resetKey`: every panel goes back to its default size. */
export const Reset: Story = {
  render: () => <ResettableColumns />,
  parameters: exampleDocs(factories, 'ResettableColumns'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('separator', { name: 'Resize Side' });
    handle.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(handle).toHaveAttribute('aria-valuenow', '244');
    await userEvent.click(canvas.getByRole('button', { name: 'Reset layout' }));
    await expect(handle).toHaveAttribute('aria-valuenow', '220');
  },
};

export const SeeThroughGap: Story = {
  render: () => <ColumnsWithGap />,
  parameters: exampleDocs(factories, 'ColumnsWithGap'),
};

/**
 * A handle at each side edge reports the width wanted and the example applies it to the container. The card
 * grows about its centre, so one 24px arrow step is 48px of width; the limits hold and Enter puts it back.
 */
export const OuterEdges: Story = {
  render: () => <CardResizedFromBothSides />,
  parameters: exampleDocs(factories, 'CardResizedFromBothSides'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const right = canvas.getByRole('separator', { name: 'Resize from the right edge' });
    const left = canvas.getByRole('separator', { name: 'Resize from the left edge' });
    await expect(right).toHaveAttribute('aria-valuenow', '420');
    await expect(right).toHaveAttribute('aria-valuemax', '640');
    right.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByText('468px, from the end edge')).toBeVisible();
    left.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByText('516px, from the start edge')).toBeVisible();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('420px')).toBeVisible();
  },
};

/** Stacked, with a handle at the bottom edge only: the top stays put and ArrowDown makes the card 24px taller. */
export const OuterEdgeVertical: Story = {
  render: () => <CardResizedFromBottom />,
  parameters: exampleDocs(factories, 'CardResizedFromBottom'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bottom = canvas.getByRole('separator', { name: 'Resize from the bottom edge' });
    await expect(bottom).toHaveAttribute('aria-orientation', 'horizontal');
    bottom.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByText('224px')).toBeVisible();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('200px')).toBeVisible();
  },
};

/**
 * The kept sizes add up to more than the card is wide. By default the splitter scrolls along its orientation, so
 * no panel is cut off; set `overflow="clip"` where whatever holds the splitter should cut the panels instead.
 */
export const WiderThanItsContainer: Story = {
  render: () => <ColumnsWiderThanTheirContainer />,
  parameters: exampleDocs(factories, 'ColumnsWiderThanTheirContainer'),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>('[data-slot="splitter"]');
    await expect(root).toHaveAttribute('data-overflow', 'scroll');
    await expect(root?.scrollWidth ?? 0).toBeGreaterThan(root?.clientWidth ?? 0);
  },
};
