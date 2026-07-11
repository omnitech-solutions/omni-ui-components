import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Pagination } from '@omnitech/omni-ui-core/Pagination';

describe('omni-ui-components/Pagination', () => {
  it('calls onChange for next page', async () => {
    const user = userEvent.setup();
    const handle = jest.fn();
    render(<Pagination current={1} total={30} pageSize={10} onChange={handle} />);
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(handle).toHaveBeenCalledWith(2, 10);
  });
});
