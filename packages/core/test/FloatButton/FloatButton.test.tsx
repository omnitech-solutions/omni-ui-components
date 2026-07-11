import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { FloatButton } from '@omnitech/omni-ui-core/FloatButton';

describe('omni-ui-components/FloatButton', () => {
  it('renders as a button', () => {
    render(<FloatButton aria-label="Create">+</FloatButton>);
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });
});
