import '@testing-library/jest-dom';

import { Divider } from '@oc-tech/omni-ui-components/Divider';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/Divider', () => {
  it('renders label when provided', () => {
    render(<Divider>OR</Divider>);
    expect(screen.getByText('OR')).toBeInTheDocument();
  });
});
