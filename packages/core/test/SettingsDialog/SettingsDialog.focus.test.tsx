import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SettingsDialogDemo } from 'factories/omni-ui-components/SettingsDialog/SettingsDialog.factories';

describe('omni-ui-components/SettingsDialog focus return', () => {
  it('returns focus to the element that opened it after Escape', async () => {
    render(<SettingsDialogDemo />);
    const opener = screen.getByRole('button', { name: 'Open settings' });
    await userEvent.click(opener);
    await screen.findByRole('dialog', { name: 'Settings' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(opener).toHaveFocus());
  });
});
