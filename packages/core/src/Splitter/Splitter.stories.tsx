import { Splitter, SplitterPanel } from '@oc-tech/omni-ui-components/Splitter';
import type { Meta, StoryObj } from '@storybook/react';
import {
  SplitterDemo,
  type SplitterDemoProps,
} from 'factories/omni-ui-components/Splitter/Splitter.factories';
import type * as React from 'react';
import { expect, userEvent, within } from 'storybook/test';

const meta: Meta<SplitterDemoProps> = {
  title: 'omni-ui-components/Splitter',
  component: SplitterDemo as unknown as React.ComponentType<SplitterDemoProps>,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '<primary>Split-panel layout</primary>. Static by default. With `resizable`, a panel that has a numeric `defaultSize` (px) gets a handle: drag it, or focus it and use the arrow keys, Home and End; double-click or Enter puts that panel back, and a changed `resetKey` puts every panel back. A panel without a size takes the room that is left. Sizes are px by panel `id`, controlled with `sizes` or kept inside from `defaultSizes`; <primary>onSizesChange(sizes)</primary> fires either way, <primary>onResizeStart(panelId)</primary> and <primary>onResizeEnd(panelId, sizes)</primary> report a held handle. `minSize` and `maxSize` bound a panel, `handleProps` reaches every handle, and the handle name comes from `labels.handle(panelLabel)`. A panel paints nothing of its own, so an empty one is a see-through gap.',
      },
    },
  },
  argTypes: {
    resizable: { control: 'boolean', description: 'Draw handles and keep sizes.' },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    keyboardStep: { control: { type: 'number', min: 1 }, description: 'Px per arrow key press.' },
    limits: { control: 'boolean', description: 'Story-only: give the panels a floor and ceiling.' },
    reset: { control: 'boolean', description: 'Story-only: show the Reset layout button.' },
    gap: { control: 'boolean', description: 'Story-only: the middle panel paints nothing.' },
    onAction: { action: 'splitter', description: 'Story-only: reports sizes and resize events.' },
  },
};
export default meta;

type Story = StoryObj<SplitterDemoProps>;

export const Default: Story = {
  render: () => (
    <Splitter className="h-48">
      <SplitterPanel defaultSize="35%" className="p-4">
        Left panel
      </SplitterPanel>
      <SplitterPanel className="p-4">Right panel</SplitterPanel>
    </Splitter>
  ),
};

export const ThreePanels: Story = {
  render: () => (
    <Splitter className="h-48">
      <SplitterPanel defaultSize="20%" className="p-4">
        Nav
      </SplitterPanel>
      <SplitterPanel defaultSize="40%" className="p-4">
        Content
      </SplitterPanel>
      <SplitterPanel className="p-4">Inspector</SplitterPanel>
    </Splitter>
  ),
};

export const Draggable: Story = {
  args: { resizable: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('separator', { name: 'Resize list' });
    handle.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(handle).toHaveAttribute('aria-valuenow', '204');
    await userEvent.keyboard('{Enter}');
    await expect(handle).toHaveAttribute('aria-valuenow', '180');
  },
};

export const Vertical: Story = { args: { resizable: true, orientation: 'vertical' } };

export const WithLimits: Story = { args: { resizable: true, limits: true } };

export const Reset: Story = {
  args: { resizable: true, reset: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('separator', { name: 'Resize side' });
    handle.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(handle).toHaveAttribute('aria-valuenow', '244');
    await userEvent.click(canvas.getByRole('button', { name: 'Reset layout' }));
    await expect(handle).toHaveAttribute('aria-valuenow', '220');
  },
};

export const SeeThroughGap: Story = { args: { resizable: true, gap: true } };
