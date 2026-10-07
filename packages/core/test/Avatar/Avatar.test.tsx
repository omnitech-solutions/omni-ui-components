import '@testing-library/jest-dom';

import { Avatar } from '@oc-tech/omni-ui-components/Avatar';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/Avatar', () => {
  it('renders fallback content', () => {
    render(<Avatar fallback="OU" />);
    expect(screen.getByText('OU')).toBeInTheDocument();
  });
});
