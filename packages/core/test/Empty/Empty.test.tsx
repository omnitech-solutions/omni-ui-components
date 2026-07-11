import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Empty } from '@omnitech/omni-ui-core/Empty';

describe('omni-ui-components/Empty', () => {
  it('renders description', () => {
    render(<Empty description="No rows" />);
    expect(screen.getByText('No rows')).toBeInTheDocument();
  });
});
