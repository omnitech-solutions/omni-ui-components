import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Affix } from '@oc-tech/omni-ui-components/Affix';

describe('omni-ui-components/Affix', () => {
  it('renders children and sticky positioning', () => {
    render(<Affix offsetTop={12}>Sticky</Affix>);
    const node = screen.getByText('Sticky');
    expect(node).toBeInTheDocument();
    expect(node).toHaveStyle({ position: 'sticky', top: '12px' });
  });
});
