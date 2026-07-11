import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Rate } from '@omnitech/omni-ui-core/Rate';

describe('omni-ui-components/Rate', () => {
  it('changes rating on click', async () => {
    const user = userEvent.setup();
    const handle = jest.fn();
    render(<Rate onChange={handle} />);
    await user.click(screen.getAllByRole('button')[2]);
    expect(handle).toHaveBeenCalledWith(3);
  });
});
