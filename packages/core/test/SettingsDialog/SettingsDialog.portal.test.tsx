import '@testing-library/jest-dom';

import { SettingsDialog } from '@oc-tech/omni-ui-components/SettingsDialog';
import { render, screen } from '@testing-library/react';
import { settingsDialogPropsFactory } from 'factories/omni-ui-components/SettingsDialog/SettingsDialog.factories';

describe('omni-ui-components/SettingsDialog portal', () => {
  it('mounts the dialog and its backdrop in a custom container with data-oui-surface', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    render(<SettingsDialog {...settingsDialogPropsFactory()} container={host} />);
    const surface = screen.getByRole('dialog', { name: 'Settings' });
    expect(host).toContainElement(surface);
    expect(surface).toHaveAttribute('data-oui-surface', 'settings-dialog');
    expect(host.querySelector('[data-oui-surface="settings-backdrop"]')).not.toBeNull();
    host.remove();
  });

  it('mounts in body by default', () => {
    const { container } = render(<SettingsDialog {...settingsDialogPropsFactory()} />);
    const surface = screen.getByRole('dialog', { name: 'Settings' });
    expect(container).not.toContainElement(surface);
    expect(surface.parentElement).toBe(document.body);
    expect(surface).toHaveAttribute('data-oui-surface', 'settings-dialog');
  });
});
