import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ContextMeter, type ContextMeterProps } from '@oc-tech/omni-ui-components/ContextMeter';
import { contextMeterPropsFactory, contextMeterVariants } from 'factories/omni-ui-components/ContextMeter/ContextMeter.factories';

const Stage: React.FC<React.PropsWithChildren<{ minHeight?: number }>> = ({ minHeight = 360, children }) => (
  <div className="flex items-end justify-end p-6" style={{ minHeight }}>
    {children}
  </div>
);

const meta: Meta<ContextMeterProps> = {
  title: 'omni-ui-components/ContextMeter',
  component: ContextMeter,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A <primary>ring button</primary> showing how full the model\'s context window is (an estimate). The ring is accent, <primary>amber above `thresholds.warn`</primary> (60%) and <primary>red above `thresholds.danger`</primary> (80%); with no `window` it is empty and the tooltip says how many tokens are in context. The ring opens a popover (`role="dialog"`) with the percent, a bar, `About 3.1k of 262k tokens`, a row per section (in k), the note and an optional <primary>Summarise now</primary> button. The popover returns focus to the ring on close and closes on Escape. `formatTokens` and `contextPercent` are exported. <primary>Callbacks</primary>\n\n| Prop | Fires when | Payload |\n|---|---|---|\n| `onSummarise` | Summarise now is chosen (the button exists only with it) | the `sections` array (`S[]`) as passed in |\n| `onOpenChange` | the popover opens or closes, controlled or not | new open state |\n',
      },
    },
  },
  args: { ...contextMeterPropsFactory() },
  argTypes: {
    used: { control: { type: 'number', min: 0, max: 400000, step: 1000 }, description: 'Estimated tokens in context.' },
    window: { control: 'number', description: 'The model window in tokens. Unset: empty ring, no percent.' },
    sections: { control: 'object', description: 'Breakdown rows `{ label, tokens }`.' },
    thresholds: { control: 'object', description: '`{ warn: 60, danger: 80 }` (exclusive).' },
    open: { control: 'boolean', description: 'Controlled open state.' },
    defaultOpen: { control: 'boolean' },
    ringSize: { control: { type: 'number', min: 14, max: 40 } },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    side: { control: 'inline-radio', options: ['top', 'bottom'] },
    labels: { control: 'object', description: 'Every string (partial): title, titleNoWindow, dialog, heading, approx, summary, note, summarise.' },
    onSummarise: { action: 'summarise', description: 'Shows the Summarise now button when given.' },
    onOpenChange: { action: 'open change' },
  },
  render: (args) => (
    <Stage>
      <ContextMeter {...args} />
    </Stage>
  ),
};
export default meta;

type Story = StoryObj<ContextMeterProps>;

/** 1% of a 262k window. Interaction: open the popover, read it, summarise, Escape returns focus to the ring. */
export const Default: Story = {
  args: { onSummarise: fn() },
  play: async ({ canvasElement, args }) => {
    const ring = canvasElement.querySelector('[data-slot="context-meter"]') as HTMLElement;
    await userEvent.click(ring);
    const dialog = await within(document.body).findByRole('dialog', { name: 'Context window' });
    await expect(within(dialog).getByText('About 3.1k of 262k tokens')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Summarise now' }));
    await expect(args.onSummarise).toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    await expect(ring).toHaveFocus();
    await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());
    await expect(ring).toHaveFocus();
  },
};

export const Low: Story = { args: { used: 31000, defaultOpen: true } };
export const Warn: Story = { args: { used: 183400, defaultOpen: true } };
export const Danger: Story = { args: { used: 235800, defaultOpen: true } };

/** Past the window: the percent clamps to 100%. */
export const Full: Story = { args: { used: 300000, defaultOpen: true } };

/** No window known: an empty ring, title `About 1.2k tokens in context`, and no bar in the popover. */
export const NoWindow: Story = { args: { window: undefined, used: 1200, defaultOpen: true } };

/** Custom thresholds 30 / 50 and no Summarise button. */
export const CustomThresholds: Story = { args: { used: 100000, thresholds: { warn: 30, danger: 50 }, onSummarise: undefined, defaultOpen: true } };

/** The ring at every level, closed. */
export const RingLevels: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-6 p-6">
      {contextMeterVariants
        .filter((variant) => !variant.name.startsWith('Custom') && !variant.name.startsWith('No summarise'))
        .map((variant) => (
          <div key={variant.name} className="flex flex-col items-center gap-1">
            <ContextMeter {...args} {...variant.args} />
            <span className="font-mono text-[11px] text-muted-foreground">{variant.name}</span>
          </div>
        ))}
    </div>
  ),
};

/** Strings through `labels`. */
export const TranslatedLabels: Story = {
  args: {
    defaultOpen: true,
    labels: {
      title: (percent) => `Contexto: ${percent}% usado`,
      dialog: 'Ventana de contexto',
      heading: 'Ventana de contexto',
      summary: (used, window) => `Unos ${used} de ${window} tokens`,
      note: 'Al llenarse, los turnos antiguos se resumen; nunca se descartan en silencio.',
      summarise: 'Resumir ahora',
    },
  },
};
