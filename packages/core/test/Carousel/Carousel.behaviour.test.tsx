import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Carousel } from '@oc-tech/omni-ui-components/Carousel';

describe('omni-ui-components/Carousel', () => {
  it('shows one slide at a time and wraps around in both directions', async () => {
    const user = userEvent.setup();
    render(
      <Carousel>
        <div>one</div>
        <div>two</div>
        <div>three</div>
      </Carousel>,
    );
    const [previous, next] = screen.getAllByRole('button');
    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.queryByText('two')).not.toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    await user.click(next);
    expect(screen.getByText('two')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
    await user.click(next);
    await user.click(next);
    expect(screen.getByText('one')).toBeInTheDocument();

    await user.click(previous);
    expect(screen.getByText('three')).toBeInTheDocument();
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('hides the controls for a single slide and renders nothing for none', () => {
    const { container, rerender } = render(
      <Carousel className="extra">
        <div>only</div>
      </Carousel>,
    );
    expect(screen.getByText('only')).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(container.firstChild).toHaveClass('extra');
    rerender(<Carousel />);
    expect(screen.queryByText('only')).not.toBeInTheDocument();
  });
});
