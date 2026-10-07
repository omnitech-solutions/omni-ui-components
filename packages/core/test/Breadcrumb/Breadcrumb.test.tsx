import '@testing-library/jest-dom';

import { Breadcrumb } from '@oc-tech/omni-ui-components/Breadcrumb';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/Breadcrumb', () => {
  it('renders breadcrumb navigation', () => {
    render(<Breadcrumb items={[{ href: '/home', title: 'Home' }, { title: 'Current' }]} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/home');
  });
});
