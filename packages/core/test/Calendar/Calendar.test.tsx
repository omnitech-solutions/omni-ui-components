import '@testing-library/jest-dom';

import { Calendar } from '@oc-tech/omni-ui-components/Calendar';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/Calendar', () => {
  it('renders a grid of days', () => {
    render(<Calendar mode="single" />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });
});
