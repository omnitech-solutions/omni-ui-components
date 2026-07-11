import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Collapse } from '@omnitech/omni-ui-core/Collapse';

describe('omni-ui-components/Collapse', () => {
  it('toggles panel content', async () => {
    const user = userEvent.setup();
    render(<Collapse items={[{ key: '1', label: 'General', children: 'Panel body' }]} />);
    expect(screen.queryByText('Panel body')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /General/ }));
    expect(screen.getByText('Panel body')).toBeInTheDocument();
  });
});
