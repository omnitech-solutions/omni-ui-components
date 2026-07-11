import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Badge } from '@omnitech/omni-ui-core/Badge';

describe('omni-ui-components/Badge', () => {
  it('renders content', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});
