import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Progress } from '@omnitech/omni-ui-core/Progress';

describe('omni-ui-components/Progress', () => {
  it('renders percent text', () => {
    render(<Progress percent={45} />);
    expect(screen.getByText('45%')).toBeInTheDocument();
  });
});
