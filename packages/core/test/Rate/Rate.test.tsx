import '@testing-library/jest-dom';

import { Rate } from '@oc-tech/omni-ui-components/Rate';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('omni-ui-components/Rate', () => {
  it('changes rating on click', async () => {
    const user = userEvent.setup();
    const handle = jest.fn();
    render(<Rate onChange={handle} />);
    await user.click(screen.getAllByRole('button')[2]);
    expect(handle).toHaveBeenCalledWith(3);
  });

  it('names every star, and says which are chosen', () => {
    const { rerender } = render(<Rate value={2} count={3} />);
    expect(screen.getAllByRole('button').map((each) => each.getAttribute('aria-label'))).toEqual([
      '1 star',
      '2 stars',
      '3 stars',
    ]);
    expect(screen.getByRole('button', { name: '2 stars' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '3 stars' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    rerender(<Rate value={2} count={3} starLabel={(value, count) => `${value} von ${count}`} />);
    expect(screen.getByRole('button', { name: '3 von 3' })).toBeInTheDocument();
  });
});
