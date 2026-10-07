import '@testing-library/jest-dom';

import { Timeline } from '@oc-tech/omni-ui-components/Timeline';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/Timeline', () => {
  it('renders timeline items', () => {
    render(<Timeline items={[{ children: 'Created' }, { children: 'Approved' }]} />);
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });
});
