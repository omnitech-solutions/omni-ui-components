import '@testing-library/jest-dom';

import { Space } from '@oc-tech/omni-ui-components/Space';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/Space', () => {
  it('renders spaced children', () => {
    render(
      <Space>
        <span>One</span>
        <span>Two</span>
      </Space>,
    );
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });
});
