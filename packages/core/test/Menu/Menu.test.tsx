import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Menu } from '@oc-tech/omni-ui-components/Menu';

describe('omni-ui-components/Menu', () => {
  it('renders menu items', () => {
    render(<Menu items={[{ key: '1', label: 'Dashboard' }]} />);
    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
  });
});
