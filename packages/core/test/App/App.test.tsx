import '@testing-library/jest-dom';

import { App } from '@oc-tech/omni-ui-components/App';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/App', () => {
  it('renders children unchanged', () => {
    render(
      <App>
        <div>Shell</div>
      </App>,
    );
    expect(screen.getByText('Shell')).toBeInTheDocument();
  });
});
