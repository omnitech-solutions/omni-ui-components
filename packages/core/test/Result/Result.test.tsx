import '@testing-library/jest-dom';

import { Result } from '@oc-tech/omni-ui-components/Result';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/Result', () => {
  it('renders title and subtitle', () => {
    render(<Result title="Saved" subTitle="All changes applied" />);
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('All changes applied')).toBeInTheDocument();
  });
});
