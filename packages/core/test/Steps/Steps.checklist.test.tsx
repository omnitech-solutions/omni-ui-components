import '@testing-library/jest-dom';

import { Steps } from '@oc-tech/omni-ui-components/Steps';
import { render, screen, within } from '@testing-library/react';
import {
  stepsChecklistItems,
  stepsVariants,
} from 'factories/omni-ui-components/Steps/Steps.factories';

describe('omni-ui-components/Steps checklist', () => {
  it('is a list with one item per step, read only (no buttons)', () => {
    render(<Steps variant="checklist" items={stepsChecklistItems()} />);
    const list = screen.getByRole('list', { name: 'Steps' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows done as a check, current as an indeterminate ring, pending as a plain circle', () => {
    const { container } = render(<Steps variant="checklist" items={stepsChecklistItems()} />);
    const [done, current, pending] = Array.from(container.querySelectorAll('li'));
    expect(done).toHaveAttribute('data-state', 'done');
    expect(done.querySelector('svg')).not.toBeNull();
    expect(done.querySelector('[data-slot="progress-ring"]')).toBeNull();
    expect(current).toHaveAttribute('data-state', 'current');
    expect(current.querySelector('[data-slot="progress-ring"]')).toHaveAttribute(
      'data-indeterminate',
      'true',
    );
    expect(pending).toHaveAttribute('data-state', 'pending');
    expect(pending.querySelector('svg')).toBeNull();
    expect(pending.querySelector('[data-slot="progress-ring"]')).toBeNull();
  });

  it('marks only the current step with aria-current and keeps the decorative ring out of the a11y tree', () => {
    const { container } = render(<Steps variant="checklist" items={stepsChecklistItems()} />);
    const marked = container.querySelectorAll('[aria-current="step"]');
    expect(marked).toHaveLength(1);
    expect(marked[0]).toHaveTextContent('Reading the problem');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('states each step for screen readers', () => {
    render(<Steps variant="checklist" items={stepsChecklistItems()} />);
    expect(screen.getByText('(done)')).toBeInTheDocument();
    expect(screen.getByText('(in progress)')).toBeInTheDocument();
    expect(screen.getByText('(pending)')).toBeInTheDocument();
  });

  it('reads label, falls back to title, and treats a missing state as pending', () => {
    render(
      <Steps
        variant="checklist"
        items={[{ title: 'From title' }, { label: 'From label', state: 'done' }]}
      />,
    );
    expect(screen.getByText('From title').closest('li')).toHaveAttribute('data-state', 'pending');
    expect(screen.getByText('From label')).toBeInTheDocument();
  });

  it('does not change the default variant', () => {
    render(<Steps items={[{ title: 'Question' }, { title: 'Solution' }]} current={1} />);
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.getByText('Solution').closest('button')).toHaveAttribute('aria-current', 'step');
  });

  it('renders every factory variant', () => {
    stepsVariants.forEach((variant) => {
      const { unmount } = render(<Steps items={[{ title: 'a' }]} {...variant.args} />);
      expect(screen.getByRole('list')).toBeInTheDocument();
      unmount();
    });
  });
});
