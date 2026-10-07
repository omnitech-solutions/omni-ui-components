import '@testing-library/jest-dom';

import { Button } from '@oc-tech/omni-ui-components/Button';
import { Popconfirm } from '@oc-tech/omni-ui-components/Popconfirm';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('omni-ui-components/Popconfirm', () => {
  it('shows confirm content when opened', async () => {
    const user = userEvent.setup();
    render(
      <Popconfirm title="Delete?">
        <Button>Open</Button>
      </Popconfirm>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByText('Delete?')).toBeInTheDocument();
  });

  it('closes after confirm and after cancel, running the callback', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <Popconfirm title="Delete?" onConfirm={onConfirm} onCancel={onCancel}>
        <Button>Open</Button>
      </Popconfirm>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText('Delete?')).toBeNull());
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText('Delete?')).toBeNull());
  });
});
