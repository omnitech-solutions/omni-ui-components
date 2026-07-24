import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Tour } from '@oc-tech/omni-ui-components/Tour';

describe('omni-ui-components/Tour', () => {
  it('renders current step when open', () => {
    render(<Tour open steps={[{ title: 'Welcome', description: 'Intro' }]} />);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Intro')).toBeInTheDocument();
  });

  it('moves to the next step when requested', async () => {
    const user = userEvent.setup();
    const handleCurrentChange = jest.fn();

    render(
      <Tour
        open
        current={0}
        steps={[
          { title: 'Welcome', description: 'Intro' },
          { title: 'Queue', description: 'Review work' },
        ]}
        onCurrentChange={handleCurrentChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(handleCurrentChange).toHaveBeenCalledWith(1);
  });
});
