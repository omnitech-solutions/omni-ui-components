import '@testing-library/jest-dom';
import type { ModelInfo } from '@oc-tech/omni-ui-components/ModelPicker';
import { ModelsSettings } from '@oc-tech/omni-ui-components/ModelsSettings';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ModelsSettingsDialogDemo,
  modelsSettingsPropsFactory,
  modelsSettingsVariants,
} from 'factories/omni-ui-components/ModelsSettings/ModelsSettings.factories';

describe('omni-ui-components/ModelsSettings', () => {
  it('shows a read-only endpoint, the status and a row per model', () => {
    render(<ModelsSettings {...modelsSettingsPropsFactory()} />);
    const endpoint = screen.getByRole('textbox', { name: 'Endpoint' });
    expect(endpoint).toHaveValue('http://localhost:1234/v1');
    expect(endpoint).toHaveAttribute('readonly');
    expect(screen.getByRole('status')).toHaveTextContent('Connected · 3 models');
    expect(
      within(screen.getByRole('list', { name: 'Available models' })).getAllByRole('listitem'),
    ).toHaveLength(3);
  });

  it('onAddProvider fires from the Add provider button', async () => {
    const onAddProvider = jest.fn();
    render(<ModelsSettings {...modelsSettingsPropsFactory({ onAddProvider })} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add provider' }));
    expect(onAddProvider).toHaveBeenCalledTimes(1);
  });

  it('hides the cloud-providers row when onAddProvider is absent', () => {
    render(<ModelsSettings {...modelsSettingsPropsFactory(modelsSettingsVariants[3].args)} />);
    expect(screen.queryByRole('button', { name: 'Add provider' })).not.toBeInTheDocument();
    expect(screen.queryByText('Cloud providers')).not.toBeInTheDocument();
  });

  it('hides the endpoint when absent and handles the other states', () => {
    const { rerender } = render(
      <ModelsSettings
        {...modelsSettingsPropsFactory({
          endpoint: undefined,
          status: 'checking',
        })}
      />,
    );
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Checking connection…');
    rerender(<ModelsSettings {...modelsSettingsPropsFactory(modelsSettingsVariants[2].args)} />);
    expect(screen.getByRole('status')).toHaveTextContent('Not connected');
    expect(screen.getByText('No models found.')).toBeInTheDocument();
    rerender(
      <ModelsSettings {...modelsSettingsPropsFactory({ models: [{ id: 'a', name: 'A' }] })} />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Connected · 1 model');
  });

  it('is generic: renderModelMeta gets the original extended item, and labels override', () => {
    interface Mine extends ModelInfo {
      owner: string;
    }
    const mine: Mine = { id: 'm', name: 'Mine', owner: 'ada' };
    const seen: Mine[] = [];
    render(
      <ModelsSettings<Mine>
        models={[mine]}
        renderModelMeta={(model) => {
          seen.push(model);
          return `owned by ${model.owner}`;
        }}
        labels={{ modelsTitle: 'Installed' }}
      />,
    );
    expect(seen[0]).toBe(mine);
    expect(screen.getByText('owned by ada')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Installed' })).toBeInTheDocument();
  });

  it('works as a SettingsDialog tab', async () => {
    const onAction = jest.fn();
    render(<ModelsSettingsDialogDemo onAction={onAction} />);
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add provider' }));
    expect(onAction).toHaveBeenCalledWith('add-provider');
  });
});
