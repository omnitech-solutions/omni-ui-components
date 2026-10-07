import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Spin } from '@oc-tech/omni-ui-components/Spin';

describe('omni-ui-components/Spin', () => {
  it('overlays a spinner and marks the content busy while spinning', () => {
    const { container } = render(
      <Spin tip="Loading…" className="extra">
        <p>content</p>
      </Spin>,
    );
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.getByText('content').parentElement).toHaveAttribute('aria-busy', 'true');
    expect(container.firstChild).toHaveClass('extra');
  });

  it('shows no overlay when not spinning', () => {
    const { container } = render(
      <Spin spinning={false} tip="Loading…">
        <p>content</p>
      </Spin>,
    );
    expect(container.querySelector('.animate-spin')).toBeNull();
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    expect(screen.getByText('content').parentElement).toHaveAttribute('aria-busy', 'false');
  });

  it('shows the spinner without a tip', () => {
    const { container } = render(<Spin />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(container.querySelectorAll('.text-sm')).toHaveLength(0);
  });
});
