import '@testing-library/jest-dom';

import { FloatButton } from '@oc-tech/omni-ui-components/FloatButton';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/FloatButton', () => {
  it('renders as a button', () => {
    render(<FloatButton aria-label="Create">+</FloatButton>);
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });
});
