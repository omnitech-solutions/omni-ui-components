import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Transfer } from '@oc-tech/omni-ui-components/Transfer';

describe('omni-ui-components/Transfer', () => {
  it('moves selected source items to target', async () => {
    const user = userEvent.setup();
    const handle = jest.fn();
    render(<Transfer dataSource={[{ key: '1', title: 'Finance' }]} targetKeys={[]} onChange={handle} />);
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: '>' }));
    expect(handle).toHaveBeenCalledWith(['1']);
  });
});
