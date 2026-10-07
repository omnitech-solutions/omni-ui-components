import '@testing-library/jest-dom';

import { ConfigProvider } from '@oc-tech/omni-ui-components/ConfigProvider';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/ConfigProvider', () => {
  it('renders children', () => {
    render(
      <ConfigProvider>
        <div>Configured</div>
      </ConfigProvider>,
    );
    expect(screen.getByText('Configured')).toBeInTheDocument();
  });
});
