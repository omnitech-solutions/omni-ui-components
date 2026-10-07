import '@testing-library/jest-dom';

import {
  capabilitiesOf,
  groupModels,
  type ModelInfo,
  ModelMenu,
  ModelPicker,
  modelLabel,
  shortName,
} from '@oc-tech/omni-ui-components';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  CLOUD_PROVIDER,
  GEMMA,
  LOCAL_PROVIDER,
  MINI,
  ModelPickerDemo,
  modelPickerPropsFactory,
  modelPickerVariants,
  QWEN,
  SONNET,
} from 'factories/omni-ui-components/ModelPicker/ModelPicker.factories';

const chip = () => document.querySelector('[data-slot="model-chip"]') as HTMLElement;

describe('omni-ui-components/ModelPicker', () => {
  describe('utilities', () => {
    it('builds the capability line in a fixed order and skips what does not apply', () => {
      expect(
        capabilitiesOf({
          id: 'x',
          name: 'X',
          contextWindow: 262144,
          tools: true,
          vision: true,
          reasoning: true,
          parameters: '30B',
        }),
      ).toBe('256k context · tools · vision · reasoning · 30B');
      expect(capabilitiesOf({ id: 'x', name: 'X', contextWindow: 2_000_000 })).toBe('2M context');
      expect(capabilitiesOf({ id: 'x', name: 'X' })).toBe('');
    });
    it('takes capability words from labels', () => {
      expect(
        capabilitiesOf(QWEN, {
          context: '{n} de contexto',
          tools: 'herramientas',
          vision: 'visión',
          reasoning: 'razonamiento',
        }),
      ).toContain('256k de contexto · herramientas');
    });
    it('labels the chip with the effort only for a reasoning model', () => {
      expect(modelLabel(QWEN, 'medium')).toBe('Qwen3 Coder · Medium');
      expect(modelLabel(QWEN, 'off')).toBe('Qwen3 Coder · Off');
      expect(modelLabel(GEMMA, 'high')).toBe('Gemma 3 12B');
      expect(modelLabel(undefined, 'high')).toBe('');
      expect(shortName(GEMMA)).toBe('Gemma 3 12B');
    });
    it('groups only consecutive models of one provider, inheriting the list provider', () => {
      const groups = groupModels(
        [QWEN, GEMMA, SONNET, MINI, { ...GEMMA, id: 'again' }],
        LOCAL_PROVIDER,
      );
      expect(groups.map((group) => [group.provider?.name, group.models.length])).toEqual([
        ['LM Studio', 2],
        ['OpenRouter', 2],
        ['LM Studio', 1],
      ]);
      expect(groupModels([MINI], undefined)[0]!.provider).toBe(CLOUD_PROVIDER);
      expect(groupModels([{ id: 'a', name: 'A' }], undefined)[0]!.provider).toBeUndefined();
    });
  });

  describe('menu', () => {
    it('is a dialog with a section per provider: local prefix, name and endpoint', () => {
      render(<ModelMenu {...modelPickerPropsFactory()} />);
      expect(screen.getByRole('dialog', { name: 'Model' })).toBeInTheDocument();
      const local = screen.getByRole('region', { name: 'LM Studio' });
      expect(local).toHaveTextContent('Local · LM Studio');
      expect(local).toHaveTextContent('http://localhost:1234/v1');
      const cloud = screen.getByRole('region', { name: 'OpenRouter' });
      expect(cloud).not.toHaveTextContent('Local');
    });

    it('draws a row per model: tags, capability line, strengths, description and aria-pressed for the selection', () => {
      render(<ModelMenu {...modelPickerPropsFactory()} />);
      const row = screen.getByRole('button', { name: /Qwen3 Coder 30B/ });
      expect(row).toHaveAttribute('aria-pressed', 'true');
      expect(row).toHaveAttribute('title', QWEN.description);
      expect(row).toHaveTextContent('Local');
      expect(row).toHaveTextContent('256k context · tools · vision · reasoning · 30B');
      expect(row).toHaveTextContent('Good for coding, agents');
      expect(screen.getByRole('button', { name: /Gemma 3 12B/ })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    });

    it('changes the effort note when the model does not reason', () => {
      const { rerender } = render(<ModelMenu {...modelPickerPropsFactory()} />);
      expect(screen.getByText('Higher effort is slower but more careful.')).toBeInTheDocument();
      rerender(<ModelMenu {...modelPickerPropsFactory({ selectedId: GEMMA.id })} />);
      expect(
        screen.getByText('Gemma 3 12B doesn’t reason step by step — effort is ignored.'),
      ).toBeInTheDocument();
    });

    it('offers Off, Low, Medium and High and reports the pick', async () => {
      const onEffortChange = vi.fn();
      render(<ModelMenu {...modelPickerPropsFactory({ onEffortChange })} />);
      const group = screen.getByRole('group', { name: 'Reasoning effort' });
      expect(
        within(group)
          .getAllByRole('radio')
          .map((radio) => radio.textContent),
      ).toEqual(['Off', 'Low', 'Medium', 'High']);
      expect(within(group).getByRole('radio', { name: 'Medium' })).toBeChecked();
      await userEvent.click(within(group).getByRole('radio', { name: 'High' }));
      expect(onEffortChange).toHaveBeenCalledWith(
        'high',
        expect.objectContaining({ id: expect.any(String) }),
      );
    });

    it('hides the effort control and the add-provider action when asked, and takes a custom scale', async () => {
      const { rerender } = render(
        <ModelMenu {...modelPickerPropsFactory({ showEffort: false, onAddProvider: undefined })} />,
      );
      expect(screen.queryByText('Reasoning effort')).toBeNull();
      expect(screen.queryByText('Add a cloud provider (optional)')).toBeNull();
      rerender(
        <ModelMenu
          {...modelPickerPropsFactory({
            efforts: [
              { value: 'fast', label: 'Fast' },
              { value: 'deep', label: 'Deep' },
            ],
            effort: 'deep',
          })}
        />,
      );
      expect(screen.getByRole('radio', { name: 'Deep' })).toBeChecked();
    });

    it('shows the add-provider action and calls it', async () => {
      const onAddProvider = vi.fn();
      render(<ModelMenu {...modelPickerPropsFactory({ onAddProvider })} />);
      await userEvent.click(
        screen.getByRole('button', { name: 'Add a cloud provider (optional)' }),
      );
      expect(onAddProvider).toHaveBeenCalled();
    });

    it('takes every string from labels', () => {
      render(
        <ModelMenu
          {...modelPickerPropsFactory({
            labels: {
              dialog: 'Modelo',
              effortTitle: 'Esfuerzo',
              local: 'Local - ',
              goodFor: 'Bueno para {strengths}',
            },
          })}
        />,
      );
      expect(screen.getByRole('dialog', { name: 'Modelo' })).toBeInTheDocument();
      expect(screen.getByText('Esfuerzo')).toBeInTheDocument();
      expect(screen.getByText(/Local - LM Studio/)).toBeInTheDocument();
      expect(screen.getByText('Bueno para coding, agents')).toBeInTheDocument();
    });
  });

  describe('chip and popover', () => {
    it('shows the label with the effort, collapsed, and opens the dialog with aria-expanded', async () => {
      render(<ModelPicker {...modelPickerPropsFactory()} />);
      expect(chip()).toHaveTextContent('Qwen3 Coder · Medium');
      expect(chip()).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('dialog')).toBeNull();
      await userEvent.click(chip());
      expect(chip()).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('dialog', { name: 'Model' })).toBeInTheDocument();
      expect(screen.getAllByRole('dialog')).toHaveLength(1);
    });

    it('picking a model reports it and closes the menu', async () => {
      const onPick = vi.fn();
      render(<ModelPicker {...modelPickerPropsFactory({ onPick })} />);
      await userEvent.click(chip());
      await userEvent.click(screen.getByRole('button', { name: /Gemma 3 12B/ }));
      expect(onPick).toHaveBeenCalledWith(GEMMA);
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('changing the effort keeps the menu open and updates the chip', async () => {
      render(<ModelPickerDemo />);
      await userEvent.click(chip());
      await userEvent.click(screen.getByRole('radio', { name: 'High' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(chip()).toHaveTextContent('Qwen3 Coder · High');
    });

    it('closes on Escape and returns focus to the chip', async () => {
      render(<ModelPicker {...modelPickerPropsFactory()} />);
      await userEvent.click(chip());
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      await userEvent.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(chip()).toHaveFocus();
    });

    it('moves focus into the menu on open', async () => {
      render(<ModelPicker {...modelPickerPropsFactory()} />);
      await userEvent.click(chip());
      expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
    });

    it('is controllable', async () => {
      const onOpenChange = vi.fn();
      render(<ModelPicker {...modelPickerPropsFactory({ open: false, onOpenChange })} />);
      await userEvent.click(chip());
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('invites a choice when nothing is selected and can be disabled', () => {
      const { rerender } = render(
        <ModelPicker {...modelPickerPropsFactory({ selectedId: undefined })} />,
      );
      expect(chip()).toHaveTextContent('Choose a model');
      rerender(<ModelPicker {...modelPickerPropsFactory({ disabled: true })} />);
      expect(chip()).toBeDisabled();
    });
  });

  describe('callbacks', () => {
    it('fires onPick and onEffortChange uncontrolled too, and renders no add-provider row without its callback', async () => {
      const onPick = vi.fn();
      const onEffortChange = vi.fn();
      render(
        <ModelMenu
          models={[QWEN, GEMMA]}
          defaultSelectedId={QWEN.id}
          onPick={onPick}
          onEffortChange={onEffortChange}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: /Gemma 3 12B/ }));
      expect(screen.getByRole('button', { name: /Gemma 3 12B/ })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await userEvent.click(screen.getByRole('radio', { name: 'High' }));
      expect(onPick).toHaveBeenCalledWith(GEMMA);
      expect(onEffortChange).toHaveBeenCalledWith(
        'high',
        expect.objectContaining({ id: expect.any(String) }),
      );
      expect(screen.queryByText('Add a cloud provider (optional)')).toBeNull();
    });
  });

  describe('picker callbacks', () => {
    it('onPick gets the id and the model; onEffortChange the value; onOpenChange the state', async () => {
      const onPick = vi.fn();
      const onEffortChange = vi.fn();
      const onOpenChange = vi.fn();
      render(
        <ModelPicker {...modelPickerPropsFactory({ onPick, onEffortChange, onOpenChange })} />,
      );
      await userEvent.click(chip());
      expect(onOpenChange).toHaveBeenLastCalledWith(true);
      await userEvent.click(screen.getByRole('radio', { name: 'Low' }));
      expect(onEffortChange).toHaveBeenCalledWith('low', QWEN);
      await userEvent.click(screen.getByRole('button', { name: /Gemma 3 12B/ }));
      expect(onPick).toHaveBeenCalledWith(GEMMA);
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });
  });

  it("passes the caller's own model objects to callbacks, extra fields intact (generic over the item)", async () => {
    type Mine = ModelInfo & { vendorId: number };
    const models: Mine[] = [
      { ...QWEN, vendorId: 1 },
      { ...GEMMA, vendorId: 2 },
    ];
    const onPick = vi.fn((model: Mine) => model.vendorId);
    const onEffortChange = vi.fn((_effort: string, model: Mine | undefined) => model?.vendorId);
    render(
      <ModelMenu<Mine>
        models={models}
        defaultSelectedId={QWEN.id}
        onPick={onPick}
        onEffortChange={onEffortChange}
      />,
    );
    await userEvent.click(screen.getByRole('radio', { name: 'High' }));
    expect(onEffortChange.mock.calls[0]![1]).toBe(models[0]);
    await userEvent.click(screen.getByRole('button', { name: /Gemma 3 12B/ }));
    expect(onPick.mock.calls[0]![0]).toBe(models[1]);
    expect(onPick).toHaveReturnedWith(2);
  });

  it('has focus on the chip right after a pick and right after Escape (before the exit animation ends)', async () => {
    render(<ModelPicker {...modelPickerPropsFactory()} />);
    await userEvent.click(chip());
    await userEvent.click(screen.getByRole('button', { name: /Gemma 3 12B/ }));
    expect(chip()).toHaveFocus();
    await userEvent.click(chip());
    await userEvent.keyboard('{Escape}');
    expect(chip()).toHaveFocus();
  });

  it('every documented variant renders', () => {
    for (const variant of modelPickerVariants) {
      const { unmount } = render(<ModelPicker {...modelPickerPropsFactory(variant.args)} />);
      expect(document.querySelector('[data-slot="model-chip"]')).toBeInTheDocument();
      unmount();
    }
  });
});
