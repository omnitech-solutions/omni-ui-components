import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Anchor } from '@oc-tech/omni-ui-components/Anchor';

describe('omni-ui-components/Anchor', () => {
  it('renders anchor links', () => {
    render(<Anchor items={[{ href: '#overview', title: 'Overview' }]} />);
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('href', '#overview');
  });
});
