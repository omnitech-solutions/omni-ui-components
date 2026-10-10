import type { Meta, StoryObj } from '@storybook/react';
import { ThemedSet } from 'factories/omni-ui-components/Theming/Theming.factories';
import { expect, within } from 'storybook/test';

const meta: Meta = {
  title: 'omni-ui-components/Theming',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`data-theme` on any ancestor themes its subtree: derived tokens are recomputed on every theme root. Set a token override on the same element as <primary>data-theme</primary>, or below it. <code>--oui-panel-see-through</code> (0.22 to 1) mixes surface backgrounds only.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const bg = (el: Element) => getComputedStyle(el).backgroundColor;
const panelOf = (root: HTMLElement) => root.querySelector('[data-slot="panel"]') as HTMLElement;

/** Two sibling containers, one dark and one light, plus a dark subtree nested in the light one and the reverse. */
export const SubtreeThemes: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
      <ThemedSet title="light-host" theme="light">
        <ThemedSet title="dark-in-light" theme="dark" />
      </ThemedSet>
      <ThemedSet title="dark-host" theme="dark">
        <ThemedSet title="light-in-dark" theme="light" />
      </ThemedSet>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const panel = (id: string) => panelOf(canvas.getByTestId(id));
    await expect(bg(panel('light-host'))).not.toBe(bg(panel('dark-host')));
    await expect(bg(panel('dark-in-light'))).toBe(bg(panel('dark-host')));
    await expect(bg(panel('light-in-dark'))).toBe(bg(panel('light-host')));
  },
};

/** Token overrides stay inside the container that sets them; the sibling keeps the stock palette. */
export const TokenOverrides: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
      <ThemedSet title="stock" theme="dark" />
      <ThemedSet
        title="branded"
        theme="dark"
        tokens={{ '--oui-panel-bg': 'rgb(10, 80, 60)', '--oui-primary': '#c2007f' }}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const branded = canvas.getByTestId('branded');
    const stock = canvas.getByTestId('stock');
    // The override reaches the subtree: a probe painted with the token matches the panel, and the stock sibling differs.
    const probe = document.createElement('div');
    probe.style.background = 'color-mix(in srgb, var(--oui-panel-bg) 100%, transparent)';
    branded.append(probe);
    await expect(bg(panelOf(branded))).toBe(bg(probe));
    probe.remove();
    await expect(bg(panelOf(branded))).not.toBe(bg(panelOf(stock)));
  },
};

/** The see-through contract: `--oui-panel-see-through` mixes backgrounds only (panel, header, dock); text and borders stay opaque. */
export const SeeThrough: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        alignItems: 'start',
        background: 'linear-gradient(135deg, #ff7a18, #af002d 60%, #319197)',
        padding: 16,
      }}
    >
      <ThemedSet title="opaque" theme="dark" tokens={{ '--oui-panel-see-through': '1' }} />
      <ThemedSet title="see-through" theme="dark" tokens={{ '--oui-panel-see-through': '0.22' }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const panel = panelOf(canvas.getByTestId('see-through'));
    await expect(bg(panel)).not.toBe(bg(panelOf(canvas.getByTestId('opaque'))));
    await expect(getComputedStyle(panel).color).toBe(
      getComputedStyle(panelOf(canvas.getByTestId('opaque'))).color,
    );
  },
};
