import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Tag } from '@omnitech/omni-ui-core/Tag';

describe('omni-ui-components/Tag', () => {
  it('renders label', () => {
    render(<Tag>Review</Tag>);
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('calls onClose when the close button is pressed', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();

    render(
      <Tag closable onClose={handleClose}>
        Filter
      </Tag>,
    );

    await user.click(screen.getByRole('button', { name: 'Remove tag' }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
