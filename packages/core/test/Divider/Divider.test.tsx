import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Divider } from '@omnitech/omni-ui-core/Divider';

describe('omni-ui-components/Divider', () => {
  it('renders label when provided', () => {
    render(<Divider>OR</Divider>);
    expect(screen.getByText('OR')).toBeInTheDocument();
  });
});
