import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from '@omnitech/omni-ui-core/Button';
import { Popconfirm } from '@omnitech/omni-ui-core/Popconfirm';

describe('omni-ui-components/Popconfirm', () => {
  it('shows confirm content when opened', async () => {
    const user = userEvent.setup();
    render(<Popconfirm title="Delete?"><Button>Open</Button></Popconfirm>);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByText('Delete?')).toBeInTheDocument();
  });
});
