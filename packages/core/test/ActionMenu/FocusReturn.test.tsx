import '@testing-library/jest-dom';
import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { ActionMenu } from '@oc-tech/omni-ui-components/ActionMenu';

const menu = (returnFocus?: 'keyboard' | 'always') => (
  <ActionMenu
    label="Menu"
    returnFocus={returnFocus}
    trigger={<button>open</button>}
    sections={[{ id: 's', selection: 'none', items: [{ id: 'a', label: 'Alpha' }] }]}
  />
);

describe('ActionMenu focus return', () => {
  it('Escape after a pointer open returns focus to the trigger', async () => {
    render(menu());
    await userEvent.click(screen.getByRole('button', { name: 'open' }));
    await screen.findByRole('menuitem', { name: 'Alpha' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menuitem')).toBeNull());
    await waitFor(() => expect(screen.getByRole('button', { name: 'open' })).toHaveFocus());
  });
  it('a pointer selection leaves nothing focused (keyboard mode)', async () => {
    render(menu());
    await userEvent.click(screen.getByRole('button', { name: 'open' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Alpha' }));
    await waitFor(() => expect(screen.queryByRole('menuitem')).toBeNull());
    expect(screen.getByRole('button', { name: 'open' })).not.toHaveFocus();
  });
});
