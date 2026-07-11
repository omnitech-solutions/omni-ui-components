import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Calendar } from '@omnitech/omni-ui-core/Calendar';

describe('omni-ui-components/Calendar', () => {
  it('renders a grid of days', () => {
    render(<Calendar mode="single" />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });
});
