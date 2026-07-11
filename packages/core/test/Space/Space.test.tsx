import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Space } from '@omnitech/omni-ui-core/Space';

describe('omni-ui-components/Space', () => {
  it('renders spaced children', () => {
    render(<Space><span>One</span><span>Two</span></Space>);
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });
});
