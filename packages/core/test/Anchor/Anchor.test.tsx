import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Anchor } from '@omnitech/omni-ui-core/Anchor';

describe('omni-ui-components/Anchor', () => {
  it('renders anchor links', () => {
    render(<Anchor items={[{ href: '#overview', title: 'Overview' }]} />);
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('href', '#overview');
  });
});
