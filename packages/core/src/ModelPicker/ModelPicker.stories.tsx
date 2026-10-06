import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ModelMenu, ModelPicker, type ModelPickerProps } from '@oc-tech/omni-ui-components/ModelPicker';
import {
  ComposerToolbarDemo,
  GEMMA,
  modelPickerPropsFactory,
  ModelPickerDemo,
  QWEN,
  SONNET,
} from 'factories/omni-ui-components/ModelPicker/ModelPicker.factories';

type StoryArgs = ModelPickerProps & { onAction?: (name: string, detail?: unknown) => void };

const Stage: React.FC<React.PropsWithChildren<{ minHeight?: number }>> = ({ minHeight = 560, children }) => (
  <div className="flex items-end p-6" style={{ minHeight }}>
    {children}
  </div>
);

const meta: Meta<StoryArgs> = {
  title: 'omni-ui-components/ModelPicker',
  component: ModelPicker as unknown as React.ComponentType<StoryArgs>,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A <primary>chip</primary> (`ShortName · Effort` for a reasoning model, the name otherwise) that opens a <primary>model menu</primary> in a popover. Models are grouped by <primary>consecutive provider</primary> (local prefix and endpoint in the header); each row shows name and tags, the capability line (`capabilitiesOf`), what it is good for and the description, and `aria-pressed` marks the selection. The <primary>reasoning effort</primary> Segmented sits below with a note that changes when the model does not reason. Picking a model closes the menu; changing the effort does not. The popover moves focus in, closes on Escape and returns focus to the chip. `ModelMenu` is the same menu without the popover. <primary>Callbacks</primary>\n\n| Prop | Fires when | Payload |\n|---|---|---|\n| `onPick` | a model row is chosen; the menu then closes | the model object (`M`), by reference |\n| `onEffortChange` | another effort is chosen; the menu stays open | effort value, then the selected model (`M` or undefined) |\n| `onAddProvider` | Add a cloud provider is chosen (the row exists only with it) | none |\n| `onOpenChange` | the menu opens or closes, controlled or not | new open state |\n',
      },
    },
  },
  args: { ...modelPickerPropsFactory() },
  argTypes: {
    models: { control: 'object', description: 'Listing order matters: consecutive models of one provider form a group.' },
    provider: { control: 'object', description: 'Provider of every model without its own: `{ name, endpoint?, local? }`.' },
    selectedId: { control: 'text' },
    effort: { control: 'select', options: ['off', 'low', 'medium', 'high'] },
    efforts: { control: 'object', description: 'Custom scale `[{ value, label }]`; default Off / Low / Medium / High.' },
    showEffort: { control: 'boolean', description: 'Show the effort control. Default true.' },
    open: { control: 'boolean', description: 'Controlled open state.' },
    defaultOpen: { control: 'boolean' },
    disabled: { control: 'boolean' },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    side: { control: 'inline-radio', options: ['top', 'bottom'] },
    labels: { control: 'object', description: 'Every string (partial): dialog, noModel, local, capabilities, goodFor, effort texts, efforts, addProvider.' },
    icons: { control: false, description: 'Caller-supplied nodes: check, add, expand.' },
    onPick: { action: 'pick' },
    onEffortChange: { action: 'effort' },
    onAddProvider: { action: 'add provider' },
    onOpenChange: { action: 'open change' },
    onAction: { action: 'demo', description: 'Story-only: the demo reports pick, effort, add-provider.' },
  },
  render: (args) => {
    const { onAction, ...props } = args;
    return (
      <Stage>
        <ModelPickerDemo {...props} onAction={onAction} />
      </Stage>
    );
  },
};
export default meta;

type Story = StoryObj<StoryArgs>;

/** A reasoning model selected, two providers (local and hosted). The chip reads `Qwen3 Coder · Medium`. */
export const Default: Story = {
  /** Interaction: open, see the groups, pick another model (menu closes), reopen, change effort (menu stays open). */
  play: async ({ canvasElement }) => {
    const chip = canvasElement.querySelector('[data-slot="model-chip"]') as HTMLElement;
    await expect(chip).toHaveTextContent('Qwen3 Coder · Medium');
    await userEvent.click(chip);
    const dialog = await within(document.body).findByRole('dialog', { name: 'Model' });
    await expect(within(dialog).getByRole('region', { name: 'LM Studio' })).toHaveTextContent('Local · LM Studio');
    await userEvent.click(within(dialog).getByRole('button', { name: /Gemma 3 12B/ }));
    await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());
    await expect(chip).toHaveTextContent('Gemma 3 12B');
    await expect(chip).toHaveFocus();
    await userEvent.click(chip);
    await userEvent.click(await within(document.body).findByRole('button', { name: /Qwen3 Coder 30B/ }));
    await userEvent.click(chip);
    const reopened = await within(document.body).findByRole('dialog');
    await userEvent.click(within(reopened).getByRole('radio', { name: 'High' }));
    await expect(within(document.body).getByRole('dialog')).toBeInTheDocument();
    await expect(chip).toHaveTextContent('Qwen3 Coder · High');
  },
};

/** The menu already open (grouped providers, tags, capability lines, strengths, effort, add provider). */
export const OpenMenu: Story = { args: { defaultOpen: true } };

/** A model that does not reason: the chip shows only its name and the note says the effort is ignored. */
export const NonReasoningModel: Story = { args: { selectedId: GEMMA.id, defaultOpen: true } };

/** A hosted model with a 1M window and no local provider header. */
export const HostedModel: Story = { args: { selectedId: SONNET.id, effort: 'high', defaultOpen: true } };

/** Only local models and no cloud-provider action. */
export const LocalOnly: Story = { args: { models: [QWEN, GEMMA], onAddProvider: undefined, defaultOpen: true } };

/** Effort control off: the menu is just the grouped list. */
export const WithoutEffort: Story = { args: { showEffort: false, defaultOpen: true } };

/** Nothing selected: the chip invites a choice. */
export const NothingSelected: Story = { args: { selectedId: undefined } };

/** The menu on its own, for a surface of your own (no popover). */
export const MenuOnly: Story = {
  render: (args) => {
    // The menu takes the picker's props minus the popover and chip ones.
    const { open: _open, defaultOpen: _defaultOpen, onOpenChange: _onOpenChange, disabled: _disabled, align: _align, side: _side, menuClassName: _menuClassName, onAction: _onAction, ...menu } = args;
    return (
      <div className="w-[340px] p-6">
        <div className="rounded-md border bg-popover p-1.5 text-popover-foreground shadow-md">
          <ModelMenu {...menu} />
        </div>
      </div>
    );
  },
};

/** Strings through `labels`. */
export const TranslatedLabels: Story = {
  args: {
    defaultOpen: true,
    labels: {
      dialog: 'Modelo',
      noModel: 'Elegir modelo',
      local: 'Local · ',
      capabilities: { context: '{n} de contexto', tools: 'herramientas', vision: 'visión', reasoning: 'razonamiento' },
      goodFor: 'Bueno para {strengths}',
      effortTitle: 'Esfuerzo de razonamiento',
      effortNote: 'Más esfuerzo es más lento pero más cuidadoso.',
      efforts: { off: 'No', low: 'Bajo', medium: 'Medio', high: 'Alto' },
      addProvider: 'Añadir un proveedor en la nube',
    },
  },
};

/** Composer toolbar: the model chip and the context meter in the `actions` slot of the library Input, next to Send. */
export const ComposerToolbar: StoryObj<{ used: number; window: number; onAction?: (name: string, detail?: unknown) => void }> = {
  args: { used: 183400, window: 262000 },
  argTypes: {
    used: { control: { type: 'number', min: 0, max: 400000, step: 1000 }, description: 'Tokens in context: the ring turns amber above 60% and red above 80%.' },
    window: { control: 'number' },
    onAction: { action: 'composer' },
  },
  render: (args) => (
    <Stage minHeight={520}>
      <ComposerToolbarDemo {...args} />
    </Stage>
  ),
};
