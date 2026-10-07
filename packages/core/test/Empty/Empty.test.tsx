import '@testing-library/jest-dom';

import { Empty } from '@oc-tech/omni-ui-components/Empty';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/Empty', () => {
  it('renders description', () => {
    render(<Empty description="No rows" />);
    expect(screen.getByText('No rows')).toBeInTheDocument();
  });
});
