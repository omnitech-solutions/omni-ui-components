import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { ConfigProvider } from '@omnitech/omni-ui-core/ConfigProvider';

describe('omni-ui-components/ConfigProvider', () => {
  it('renders children', () => {
    render(<ConfigProvider><div>Configured</div></ConfigProvider>);
    expect(screen.getByText('Configured')).toBeInTheDocument();
  });
});
