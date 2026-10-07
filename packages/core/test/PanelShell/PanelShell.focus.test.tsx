import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PanelShell } from '@oc-tech/omni-ui-components/PanelShell';

const Harness = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <PanelShell
      sidebarMode="overlay"
      sidebarOpen={open}
      onSidebarOpenChange={setOpen}
      sidebar={
        <div>
          <button type="button">First chat</button>
          <button type="button">Second chat</button>
        </div>
      }
      header={
        <button type="button" onClick={() => setOpen(true)}>
          History
        </button>
      }
    >
      <button type="button">In conversation</button>
    </PanelShell>
  );
};

describe('omni-ui-components/PanelShell overlay sidebar focus', () => {
  it('moves focus into the sidebar, traps Tab, and returns focus to the opener on Escape', async () => {
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'History' });
    await userEvent.click(opener);
    const first = screen.getByRole('button', { name: 'First chat' });
    const second = screen.getByRole('button', { name: 'Second chat' });
    await waitFor(() => expect(first).toHaveFocus());
    expect(screen.getByRole('dialog', { name: 'Conversations' })).toBeInTheDocument();
    await userEvent.tab();
    expect(second).toHaveFocus();
    await userEvent.tab();
    expect(first).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(second).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('the backdrop closes the sidebar and returns focus', async () => {
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'History' });
    await userEvent.click(opener);
    await userEvent.click(screen.getByRole('button', { name: 'Close conversations' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('a docked sidebar neither traps nor draws a backdrop', () => {
    render(<PanelShell sidebarMode="docked" sidebar={<button type="button">Chat</button>} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close conversations' })).not.toBeInTheDocument();
  });
});
