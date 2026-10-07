import '@testing-library/jest-dom';

import { Tag } from '@oc-tech/omni-ui-components/Tag';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

  it('filled variant is borderless and flagged', () => {
    render(
      <Tag variant="filled" mono>
        O(n) time
      </Tag>,
    );
    const tag = screen.getByText('O(n) time');
    expect(tag).toHaveAttribute('data-variant', 'filled');
    expect(tag.className).toContain('border-0');
    expect(tag.className).toContain('--oui-tag-filled-bg');
  });
});
