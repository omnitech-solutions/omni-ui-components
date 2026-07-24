import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Descriptions } from '@oc-tech/omni-ui-components/Descriptions';

describe('omni-ui-components/Descriptions', () => {
  it('renders labels and values', () => {
    render(<Descriptions items={[{ label: 'Owner', children: 'Alex' }]} />);
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('Alex')).toBeInTheDocument();
  });
});
