import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Result } from '@omnitech/omni-ui-core/Result';

describe('omni-ui-components/Result', () => {
  it('renders title and subtitle', () => {
    render(<Result title="Saved" subTitle="All changes applied" />);
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('All changes applied')).toBeInTheDocument();
  });
});
