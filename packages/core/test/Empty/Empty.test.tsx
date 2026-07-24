import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Empty } from '@oc-tech/omni-ui-components/Empty';

describe('omni-ui-components/Empty', () => {
  it('renders description', () => {
    render(<Empty description="No rows" />);
    expect(screen.getByText('No rows')).toBeInTheDocument();
  });
});
