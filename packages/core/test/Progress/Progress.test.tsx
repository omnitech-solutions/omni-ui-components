import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Progress } from '@oc-tech/omni-ui-components/Progress';

describe('omni-ui-components/Progress', () => {
  it('renders percent text', () => {
    render(<Progress percent={45} />);
    expect(screen.getByText('45%')).toBeInTheDocument();
  });
});
